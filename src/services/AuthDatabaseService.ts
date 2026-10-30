import { randomInt, randomUUID } from "node:crypto";
import { effectiveUserPermissions, hasPermission, permissionsForRole } from "@/lib/permissions";
import { pruefeLoginBotSchutz } from "@/lib/sicherheit/botSchutz";
import { istWegwerfEmail, kanonischeEmail } from "@/lib/sicherheit/emailSchutz";
import { hashePasswort, pruefePasswort } from "@/lib/sicherheit/passwortHash";
import type { AuthUser, LoginResponse } from "@/shared/auth/authSchemas";
import { LoginBackoffService } from "./sicherheit/LoginBackoffService";
import {
  buildClearSessionCookieHeader,
  buildSetSessionCookieHeader,
  createSessionToken,
  VF_SESSION_SECONDS,
} from "./sicherheit/SessionToken";
import {
  erhoeheSitzungsVersion,
  getSessionUser,
  upsertSessionAccountAsync,
} from "./sicherheit/SessionUserService";
import { Sitzungswachdienst } from "./sicherheit/Sitzungswachdienst";
import { createStore } from "./store/storeFactory";
import { SqlTeamsRepo } from "./store/sqlTeamsRepo";
import { SqlUsersRepo, type VfUserRecord } from "./store/sqlUsersRepo";
import type { StoredRecord } from "./store/RecordStore";

interface VerificationCodeRecord extends StoredRecord {
  emailCanonical: string;
  code: string;
  expiresAt: string;
  verified: boolean;
}

const verificationStore = () => createStore<VerificationCodeRecord>("onboarding");

function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? "127.0.0.1";
}

export function toAuthUser(user: VfUserRecord): AuthUser {
  const permissions = effectiveUserPermissions({
    role: user.role,
    roles: user.roles,
    partnerStatus: user.partnerStatus,
    permissions: user.permissions,
    banned: Boolean(user.gesperrtAm),
  });
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    roles: user.roles,
    teamId: user.teamId,
    teamName: user.teamName,
    structureId: user.structureId,
    mentorId: user.mentorId,
    partnerStatus: user.partnerStatus,
    identStatus: user.identStatus ?? "pending",
    contractSignedAt: user.contractSignedAt,
    phone: user.profilePii?.phone,
    vpkn: user.profilePii?.vpkn,
    banned: Boolean(user.gesperrtAm),
    sitzungsVersion: user.sitzungsVersion,
    permissions,
  };
}

async function ensureDefaultAdminSeeded(): Promise<void> {
  const all = await SqlUsersRepo.listAll();
  if (all.length > 0) return;

  const now = new Date().toISOString();
  await SqlTeamsRepo.upsert({
    id: "team-alpha",
    name: "Team Alpha",
    leaderId: "admin-1",
    leaderName: "Emre Ak",
    structureName: "Pycie Direktion",
    region: "Nordrhein-Westfalen",
    licenseLimit: 50,
    receivedAt: now,
    updatedAt: now,
  });

  const adminPass = process.env.VF_INITIAL_ADMIN_PASSWORD || "VisitFlow2026!";
  await SqlUsersRepo.upsert({
    id: "admin-1",
    emailCanonical: kanonischeEmail("admin@pycie.com"),
    email: "admin@pycie.com",
    passwordHash: hashePasswort(adminPass),
    name: "Emre Ak",
    role: "admin",
    roles: ["admin", "strukturleiter", "teamleiter"],
    permissions: permissionsForRole("admin"),
    teamId: "team-alpha",
    teamName: "Team Alpha",
    sitzungsVersion: 1,
    identStatus: "verified",
    contractSignedAt: now,
    profilePii: { vpkn: "VF-0001" },
    receivedAt: now,
    updatedAt: now,
  });
}

export class AuthDatabaseService {
  static async login(
    req: Request,
    body: { email?: unknown; password?: unknown; honeypot?: unknown; powTs?: unknown; powNonce?: unknown },
  ): Promise<{ ok: true; data: LoginResponse; setCookie: string } | { ok: false; error: string; status: number }> {
    await ensureDefaultAdminSeeded();

    const botCheck = pruefeLoginBotSchutz(
      { honeypot: body.honeypot, powTs: body.powTs, powNonce: body.powNonce },
      req.headers,
    );
    if (!botCheck.ok) {
      return { ok: false, error: botCheck.grund, status: 400 };
    }

    const emailRaw = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!emailRaw || !password) {
      return { ok: false, error: "Ungültige Anmeldedaten.", status: 400 };
    }

    const ip = clientIp(req);
    const geraet = req.headers.get("x-device-fingerprint") ?? undefined;
    const emailCanon = kanonischeEmail(emailRaw);

    const sperre = await LoginBackoffService.pruefeSperreAsync(ip, emailCanon, geraet);
    if (sperre.gesperrt) {
      return {
        ok: false,
        error: `Zu viele Anmeldeversuche. Bitte warte ${sperre.restSekunden ?? 15} Sekunden.`,
        status: 429,
      };
    }

    const userRecord = await SqlUsersRepo.getByEmail(emailRaw);
    if (!userRecord || !pruefePasswort(password, userRecord.passwordHash)) {
      LoginBackoffService.registriereFehlversuch(ip, emailCanon, geraet);
      return { ok: false, error: "E-Mail oder Passwort ist ungültig.", status: 401 };
    }

    if (userRecord.gesperrtAm) {
      return {
        ok: false,
        error: userRecord.sperrGrund ?? "Dieses Konto wurde gesperrt.",
        status: 403,
      };
    }

    LoginBackoffService.setzeZurueck(ip, emailCanon, geraet);

    await upsertSessionAccountAsync({
      id: userRecord.id,
      email: userRecord.email,
      name: userRecord.name,
      role: userRecord.role,
      roles: userRecord.roles,
      teamId: userRecord.teamId,
      teamName: userRecord.teamName,
      partnerStatus: userRecord.partnerStatus,
      permissions: userRecord.permissions,
      sitzungsVersion: userRecord.sitzungsVersion,
      passwordHash: userRecord.passwordHash,
    });

    const sitzung = await Sitzungswachdienst.erstelleSitzung(
      userRecord.id,
      userRecord.name,
      VF_SESSION_SECONDS,
      req,
    );
    const sessionToken = createSessionToken({
      id: userRecord.id,
      version: userRecord.sitzungsVersion,
      sessionId: sitzung.id,
      tokenId: sitzung.aktivesTokenId,
    });

    const authUser = toAuthUser(userRecord);
    return {
      ok: true,
      data: {
        user: authUser,
        token: sessionToken,
        showTeamLeiterLiveTracking: ["admin", "strukturleiter", "teamleiter"].includes(userRecord.role),
      },
      setCookie: buildSetSessionCookieHeader(sessionToken),
    };
  }

  static async sendVerification(emailRaw: string, name: string): Promise<{ ok: true; code: string } | { ok: false; error: string }> {
    const email = emailRaw.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      return { ok: false, error: "Bitte eine gültige E-Mail-Adresse eingeben." };
    }
    if (istWegwerfEmail(email)) {
      return { ok: false, error: "Wegwerf-E-Mail-Adressen sind nicht zulässig." };
    }
    const canon = kanonischeEmail(email);
    const code = String(randomInt(100000, 1000000));
    const now = new Date();
    await verificationStore().upsert({
      id: canon,
      emailCanonical: canon,
      code,
      expiresAt: new Date(now.getTime() + 15 * 60 * 1000).toISOString(),
      verified: false,
      receivedAt: now.toISOString(),
    });
    if (process.env.NODE_ENV !== "production") {
      console.info(`[AuthDatabaseService] Verifizierungscode für ${name} (${email}): ${code}`);
    }
    return { ok: true, code };
  }

  static async verifyCode(emailRaw: string, code: string): Promise<{ ok: boolean; error?: string }> {
    const canon = kanonischeEmail(emailRaw);
    const entry = await verificationStore().get(canon);
    if (!entry) {
      // Im Entwicklungsmodus Code "123456" als Universal-Testcode erlauben
      if (process.env.NODE_ENV !== "production" && code.trim() === "123456") {
        return { ok: true };
      }
      return { ok: false, error: "Kein Verifizierungscode gefunden." };
    }
    if (new Date(entry.expiresAt).getTime() < Date.now()) {
      return { ok: false, error: "Der Verifizierungscode ist abgelaufen." };
    }
    if (entry.code !== code.trim() && !(process.env.NODE_ENV !== "production" && code.trim() === "123456")) {
      return { ok: false, error: "Ungültiger Verifizierungscode." };
    }
    await verificationStore().upsert({ ...entry, verified: true });
    return { ok: true };
  }

  static async completeRegistration(
    req: Request,
    input: {
      email: string;
      name: string;
      vpkn: string;
      password: string;
      verificationCode?: string;
      contractStart?: string;
      requestedTeamId?: string;
      secondaryEmail?: string;
      referredBy?: string;
      honeypot?: unknown;
      powTs?: unknown;
      powNonce?: unknown;
    },
  ): Promise<
    | { ok: true; user: AuthUser; token: string; requiresApproval: boolean; setCookie: string }
    | { ok: false; error: string; status: number }
  > {
    await ensureDefaultAdminSeeded();

    if (req.headers.has("x-pow-ts") || input.powTs !== undefined || input.honeypot !== undefined) {
      const botCheck = pruefeLoginBotSchutz(
        { honeypot: input.honeypot, powTs: input.powTs, powNonce: input.powNonce },
        req.headers,
      );
      if (!botCheck.ok) {
        return { ok: false, error: botCheck.grund, status: 400 };
      }
    }

    const email = input.email.trim().toLowerCase();
    if (istWegwerfEmail(email)) {
      return { ok: false, error: "Wegwerf-E-Mail-Adressen sind nicht erlaubt.", status: 400 };
    }
    const existing = await SqlUsersRepo.getByEmail(email);
    if (existing) {
      return { ok: false, error: "Für diese E-Mail-Adresse existiert bereits ein Konto.", status: 409 };
    }

    if (input.verificationCode !== undefined && input.verificationCode.trim() !== "") {
      const codeCheck = await AuthDatabaseService.verifyCode(email, input.verificationCode);
      if (!codeCheck.ok) {
        return { ok: false, error: codeCheck.error ?? "Ungültiger Verifizierungscode.", status: 400 };
      }
    }

    const now = new Date().toISOString();
    const team = input.requestedTeamId ? await SqlTeamsRepo.getById(input.requestedTeamId) : null;
    const newUser: VfUserRecord = {
      id: `u-${randomUUID().slice(0, 12)}`,
      emailCanonical: kanonischeEmail(email),
      email,
      passwordHash: hashePasswort(input.password),
      name: input.name.trim(),
      role: "berater",
      roles: ["berater"],
      permissions: permissionsForRole("berater"),
      teamId: team?.id ?? input.requestedTeamId,
      teamName: team?.name,
      sitzungsVersion: 1,
      identStatus: "pending",
      profilePii: {
        vpkn: input.vpkn,
        secondaryEmail: input.secondaryEmail,
        contractStart: input.contractStart,
        referredBy: input.referredBy,
      },
      receivedAt: now,
      updatedAt: now,
    };

    await SqlUsersRepo.upsert(newUser);
    await upsertSessionAccountAsync({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      roles: newUser.roles,
      teamId: newUser.teamId,
      teamName: newUser.teamName,
      permissions: newUser.permissions,
      sitzungsVersion: 1,
      passwordHash: newUser.passwordHash,
    });

    const sitzung = await Sitzungswachdienst.erstelleSitzung(newUser.id, newUser.name, VF_SESSION_SECONDS, req);
    const token = createSessionToken({
      id: newUser.id,
      version: 1,
      sessionId: sitzung.id,
      tokenId: sitzung.aktivesTokenId,
    });

    return {
      ok: true,
      user: toAuthUser(newUser),
      token,
      requiresApproval: false,
      setCookie: buildSetSessionCookieHeader(token),
    };
  }

  static async updateProfile(
    req: Request,
    patch: Record<string, unknown>,
  ): Promise<{ ok: true; user: AuthUser } | { ok: false; error: string; status: number }> {
    const sessionUser = await getSessionUser(req);
    if (!sessionUser || sessionUser.banned) {
      return { ok: false, error: "Nicht authentifiziert.", status: 401 };
    }
    if (!hasPermission(sessionUser.permissions, "profile:*")) {
      return { ok: false, error: "Keine Berechtigung (profile:*).", status: 403 };
    }
    const existing = await SqlUsersRepo.getById(sessionUser.id);
    if (!existing) {
      return { ok: false, error: "Benutzerkonto nicht gefunden.", status: 404 };
    }
    const updatedName = typeof patch.name === "string" && patch.name.trim() ? patch.name.trim() : existing.name;
    const updated: VfUserRecord = {
      ...existing,
      name: updatedName,
      profilePii: {
        ...existing.profilePii,
        ...(typeof patch.phone === "string" ? { phone: patch.phone } : {}),
        ...(typeof patch.vpkn === "string" ? { vpkn: patch.vpkn } : {}),
        ...(typeof patch.address === "string" ? { address: patch.address } : {}),
        ...(typeof patch.iban === "string" ? { iban: patch.iban } : {}),
      },
      updatedAt: new Date().toISOString(),
    };
    await SqlUsersRepo.upsert(updated);
    await upsertSessionAccountAsync({
      id: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role,
      roles: updated.roles,
      teamId: updated.teamId,
      teamName: updated.teamName,
      permissions: updated.permissions,
      sitzungsVersion: updated.sitzungsVersion,
    });
    return { ok: true, user: toAuthUser(updated) };
  }

  static async changePassword(
    req: Request,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ ok: true; setCookie: string } | { ok: false; error: string; status: number }> {
    const sessionUser = await getSessionUser(req);
    if (!sessionUser || sessionUser.banned) {
      return { ok: false, error: "Nicht authentifiziert.", status: 401 };
    }
    if (!newPassword || newPassword.length < 8) {
      return { ok: false, error: "Das neue Passwort muss mindestens 8 Zeichen lang sein.", status: 400 };
    }
    const existing = await SqlUsersRepo.getById(sessionUser.id);
    if (!existing) {
      return { ok: false, error: "Konto nicht gefunden.", status: 404 };
    }
    if (existing.passwordHash && !pruefePasswort(currentPassword, existing.passwordHash)) {
      return { ok: false, error: "Das aktuelle Passwort ist falsch.", status: 400 };
    }
    const neueVersion = await erhoeheSitzungsVersion(existing.id);
    const neuerHash = hashePasswort(newPassword);
    await SqlUsersRepo.upsert({
      ...existing,
      passwordHash: neuerHash,
      sitzungsVersion: neueVersion,
      updatedAt: new Date().toISOString(),
    });
    const neueSitzung = await Sitzungswachdienst.erstelleSitzung(existing.id, existing.name, VF_SESSION_SECONDS, req);
    const neuesToken = createSessionToken({
      id: existing.id,
      version: neueVersion,
      sessionId: neueSitzung.id,
      tokenId: neueSitzung.aktivesTokenId,
    });
    return {
      ok: true,
      setCookie: buildSetSessionCookieHeader(neuesToken),
    };
  }

  static buildLogoutHeader(): string {
    return buildClearSessionCookieHeader();
  }
}
