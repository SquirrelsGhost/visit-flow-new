import { effectiveUserPermissions, hasPermission } from "@/lib/permissions";
import { pruefeLoginBotSchutz } from "@/lib/sicherheit/botSchutz";
import { istWegwerfEmail, kanonischeEmail } from "@/lib/sicherheit/emailSchutz";
import { pruefePasswort } from "@/lib/sicherheit/passwortHash";
import { SqlUsersRepo } from "@/services/store/sqlUsersRepo";
import type { Permission } from "@/types/permissions.types";
import { LoginBackoffService } from "./LoginBackoffService";
import {
  buildClearSessionCookieHeader,
  buildSetSessionCookieHeader,
  createSessionToken,
  readCookie,
  readSessionToken,
  VF_SESSION_COOKIE,
  VF_SESSION_SECONDS,
} from "./SessionToken";
import {
  getKontoAsync,
  getSessionUser,
  upsertSessionAccountAsync,
  type SessionUser,
} from "./SessionUserService";
import { Sitzungswachdienst } from "./Sitzungswachdienst";

export interface SessionStatusResponse {
  authenticated: boolean;
  user: SessionUser | null;
  rotated?: boolean;
}

export interface EstablishSessionInput {
  id?: unknown;
  email?: unknown;
  password?: unknown;
  name?: unknown;
  role?: unknown;
  roles?: unknown;
  partnerStatus?: unknown;
  permissions?: unknown;
  honeypot?: unknown;
  powTs?: unknown;
  powNonce?: unknown;
  geraet?: unknown;
}

const PRIVILEGED_ROLES = new Set(["admin", "strukturleiter", "teamleiter", "gebietsmanager", "mentor"]);

export type ServiceOutcome<T> =
  | { ok: true; data: T; status?: number; setCookie?: string }
  | { ok: false; error: string; status: number; setCookie?: string };

function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? "127.0.0.1";
}

export class ZeroTrustSessionService {
  /**
   * Prüft die aktuelle Sitzung und führt bei Bedarf die 15-Minuten-Token-Rotation (`erlaubeRotation = true`) durch.
   */
  static async inspectSession(req: Request): Promise<ServiceOutcome<SessionStatusResponse>> {
    const rawToken =
      readCookie(req, VF_SESSION_COOKIE) ??
      readCookie(req, "__Host-vf_session") ??
      readCookie(req, "vf_session");

    if (rawToken) {
      const daten = readSessionToken(rawToken);
      const konto = daten ? await getKontoAsync(daten.id) : undefined;
      if (daten && konto && !konto.gesperrtAm && konto.sitzungsVersion === daten.version) {
        const ua = req.headers.get("user-agent") ?? undefined;
        const pruefung = await Sitzungswachdienst.pruefeUndAktualisiere(daten.sessionId, daten.tokenId, ua, true);
        if (!pruefung.gueltig) {
          return {
            ok: true,
            data: { authenticated: false, user: null },
            setCookie: buildClearSessionCookieHeader(),
          };
        }

        const user: SessionUser = {
          id: konto.id,
          name: konto.name,
          email: konto.email,
          role: konto.role,
          roles: konto.roles,
          banned: false,
          sessionId: daten.sessionId,
          sitzungsVersion: konto.sitzungsVersion,
          permissions: effectiveUserPermissions(konto),
        };

        if (pruefung.neuesTokenId) {
          const neuesCookie = createSessionToken({
            id: konto.id,
            version: konto.sitzungsVersion,
            sessionId: daten.sessionId,
            tokenId: pruefung.neuesTokenId,
          });
          return {
            ok: true,
            data: { authenticated: true, user, rotated: true },
            setCookie: buildSetSessionCookieHeader(neuesCookie),
          };
        }

        return { ok: true, data: { authenticated: true, user, rotated: false } };
      }
    }

    const fallbackUser = await getSessionUser(req);
    return {
      ok: true,
      data: {
        authenticated: fallbackUser !== null && !fallbackUser.banned,
        user: fallbackUser && !fallbackUser.banned ? fallbackUser : null,
      },
    };
  }

  /**
   * Erstellt nach erfolgreicher Bot-Schutz-, Trash-Mail- & Backoff-Prüfung eine zustandsbehaftete Server-Sitzung.
   */
  static async establishSession(
    req: Request,
    body: EstablishSessionInput | null | undefined,
  ): Promise<ServiceOutcome<{ user: SessionUser }>> {
    if (!body || typeof body !== "object") {
      return { ok: false, error: "Ungültiger JSON-Body.", status: 400 };
    }

    const botCheck = pruefeLoginBotSchutz(
      { honeypot: body.honeypot, powTs: body.powTs, powNonce: body.powNonce },
      req.headers,
    );
    if (!botCheck.ok) {
      return { ok: false, error: botCheck.grund, status: 400 };
    }

    const rawEmail = typeof body.email === "string" ? body.email.trim() : "";
    if (!rawEmail) {
      return { ok: false, error: "Bitte eine gültige E-Mail-Adresse angeben.", status: 400 };
    }

    const email = kanonischeEmail(rawEmail);
    if (email.includes("@") && !email.endsWith(".local") && istWegwerfEmail(email)) {
      return {
        ok: false,
        error: "Wegwerf- und temporäre E-Mail-Adressen sind nicht erlaubt.",
        status: 400,
      };
    }

    const ip = clientIp(req);
    const geraet =
      (typeof body.geraet === "string" ? body.geraet : req.headers.get("x-device-fingerprint")) ?? undefined;

    const sperre = await LoginBackoffService.pruefeSperreAsync(ip, email, geraet);
    if (sperre.gesperrt) {
      return {
        ok: false,
        error: `Zu viele fehlgeschlagene Login-Versuche. Bitte warte ${sperre.restSekunden ?? 15} Sekunden.`,
        status: 429,
      };
    }

    const requestedId = typeof body.id === "string" && body.id.trim() ? body.id.trim() : email;
    const existingById = await SqlUsersRepo.getById(requestedId);
    const existingByEmail = await SqlUsersRepo.getByEmail(email);
    const existingUser = existingById ?? existingByEmail;

    const actor = await getSessionUser(req);
    const isAuthorizedAdmin = Boolean(actor && !actor.banned && hasPermission(actor.permissions, "admin:permissions"));

    // Schutz vor Konto-Übernahme: Existiert bereits ein Konto mit Passwort-Hash, muss das Passwort geprüft werden
    if (existingUser?.passwordHash && !isAuthorizedAdmin) {
      const password = typeof body.password === "string" ? body.password : "";
      if (!password || !pruefePasswort(password, existingUser.passwordHash)) {
        LoginBackoffService.registriereFehlversuch(ip, email, geraet);
        return { ok: false, error: "E-Mail oder Passwort ist ungültig.", status: 401 };
      }
    }

    const canAssignPrivileges =
      isAuthorizedAdmin || (process.env.NODE_ENV === "test" && !existingUser?.passwordHash);

    const requestedRole = typeof body.role === "string" && body.role.trim() ? body.role.trim() : undefined;
    const requestedRoles = Array.isArray(body.roles)
      ? body.roles.filter((r): r is string => typeof r === "string")
      : undefined;
    const requestedPermissions = Array.isArray(body.permissions) ? (body.permissions as Permission[]) : undefined;

    if (!canAssignPrivileges) {
      const triesPrivilegedRole =
        Boolean(requestedRole && PRIVILEGED_ROLES.has(requestedRole) && requestedRole !== existingUser?.role);
      const triesPrivilegedRoles = Boolean(
        requestedRoles?.some((r) => PRIVILEGED_ROLES.has(r) && !existingUser?.roles.includes(r)),
      );
      const triesCustomPermissions = Boolean(requestedPermissions && requestedPermissions.length > 0);
      if (triesPrivilegedRole || triesPrivilegedRoles || triesCustomPermissions) {
        return { ok: false, error: "Keine Berechtigung zur Rechte-Eskalation.", status: 403 };
      }
    }

    const id = existingUser?.id ?? requestedId;
    const role = canAssignPrivileges ? (requestedRole ?? existingUser?.role ?? "berater") : (existingUser?.role ?? "berater");
    const roles = canAssignPrivileges ? (requestedRoles ?? existingUser?.roles) : existingUser?.roles;
    const permissions = canAssignPrivileges ? (requestedPermissions ?? existingUser?.permissions) : existingUser?.permissions;
    const name =
      typeof body.name === "string" && body.name.trim()
        ? body.name.trim()
        : (existingUser?.name ?? (email.split("@")[0] || "Nutzer"));
    const partnerStatus = canAssignPrivileges
      ? (typeof body.partnerStatus === "string" ? body.partnerStatus : existingUser?.partnerStatus)
      : existingUser?.partnerStatus;

    const konto = await upsertSessionAccountAsync({
      id,
      email: existingUser?.email ?? email,
      name,
      role,
      roles,
      partnerStatus,
      permissions,
      passwordHash: existingUser?.passwordHash,
    });

    if (konto.gesperrtAm) {
      return {
        ok: false,
        error: konto.sperrGrund ?? "Dieses Konto ist gesperrt.",
        status: 403,
      };
    }

    LoginBackoffService.setzeZurueck(ip, email, geraet);

    const sitzung = await Sitzungswachdienst.erstelleSitzung(konto.id, konto.name, VF_SESSION_SECONDS, req);
    const token = createSessionToken({
      id: konto.id,
      version: konto.sitzungsVersion,
      sessionId: sitzung.id,
      tokenId: sitzung.aktivesTokenId,
    });

    const user: SessionUser = {
      id: konto.id,
      name: konto.name,
      email: konto.email,
      role: konto.role,
      roles: konto.roles,
      banned: false,
      sessionId: sitzung.id,
      sitzungsVersion: konto.sitzungsVersion,
      permissions: effectiveUserPermissions(konto),
    };

    return {
      ok: true,
      data: { user },
      status: 201,
      setCookie: buildSetSessionCookieHeader(token),
    };
  }

  static async terminateSession(req: Request): Promise<ServiceOutcome<{ loggedOut: true }>> {
    const rawToken =
      readCookie(req, VF_SESSION_COOKIE) ??
      readCookie(req, "__Host-vf_session") ??
      readCookie(req, "vf_session");
    if (rawToken) {
      const daten = readSessionToken(rawToken);
      if (daten) {
        await Sitzungswachdienst.widerrufe(daten.sessionId, "Vom Nutzer abgemeldet");
      }
    }
    return {
      ok: true,
      data: { loggedOut: true },
      setCookie: buildClearSessionCookieHeader(),
    };
  }
}
