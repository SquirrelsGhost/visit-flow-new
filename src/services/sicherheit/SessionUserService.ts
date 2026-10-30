import { DEMO_ADMIN, DEMO_LOGIN_ENABLED } from "@/lib/auth/demoSession";
import { effectiveUserPermissions, sanitizePermissions } from "@/lib/permissions";
import { kanonischeEmail } from "@/lib/sicherheit/emailSchutz";
import { clearMemoryStores } from "@/services/store/MemoryRecordStore";
import { SqlUsersRepo, type VfUserRecord } from "@/services/store/sqlUsersRepo";
import type { Permission } from "@/types/permissions.types";
import { readCookie, readSessionToken, VF_DEMO_COOKIE, VF_SESSION_COOKIE } from "./SessionToken";
import { Sitzungswachdienst } from "./Sitzungswachdienst";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  roles?: string[];
  teamId?: string;
  teamName?: string;
  banned: boolean;
  banReason?: string;
  sessionId: string;
  sitzungsVersion: number;
  permissions: Permission[];
}

export interface KontoSicherheitsStatus {
  id: string;
  name: string;
  email: string;
  role: string;
  roles?: string[];
  teamId?: string;
  teamName?: string;
  partnerStatus?: string;
  permissions: Permission[];
  sitzungsVersion: number;
  gesperrtAm?: string;
  sperrGrund?: string;
}

const kontenRegister = new Map<string, KontoSicherheitsStatus>();

function recordToKonto(user: VfUserRecord): KontoSicherheitsStatus {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    roles: user.roles,
    teamId: user.teamId,
    teamName: user.teamName,
    partnerStatus: user.partnerStatus,
    permissions: sanitizePermissions(user.permissions),
    sitzungsVersion: user.sitzungsVersion,
    gesperrtAm: user.gesperrtAm,
    sperrGrund: user.sperrGrund,
  };
}

function persistKontoInBackground(konto: KontoSicherheitsStatus, passwordHash?: string): Promise<VfUserRecord> {
  const now = new Date().toISOString();
  return SqlUsersRepo.getById(konto.id).then((existing) =>
    SqlUsersRepo.upsert({
      id: konto.id,
      emailCanonical: kanonischeEmail(konto.email),
      email: konto.email,
      passwordHash: passwordHash ?? existing?.passwordHash,
      name: konto.name,
      role: konto.role,
      roles: konto.roles ?? existing?.roles ?? [konto.role],
      permissions: konto.permissions,
      teamId: konto.teamId ?? existing?.teamId,
      teamName: konto.teamName ?? existing?.teamName,
      structureId: existing?.structureId,
      mentorId: existing?.mentorId,
      partnerStatus: konto.partnerStatus ?? existing?.partnerStatus,
      sitzungsVersion: konto.sitzungsVersion,
      gesperrtAm: konto.gesperrtAm,
      sperrGrund: konto.sperrGrund,
      identStatus: existing?.identStatus ?? "pending",
      contractSignedAt: existing?.contractSignedAt,
      profilePii: existing?.profilePii ?? {},
      receivedAt: existing?.receivedAt ?? now,
      updatedAt: now,
    }),
  );
}

export interface UpsertSessionAccountInput {
  id: string;
  name?: string;
  email: string;
  role?: string;
  roles?: string[];
  teamId?: string;
  teamName?: string;
  partnerStatus?: string;
  permissions?: readonly Permission[];
  sitzungsVersion?: number;
  gesperrtAm?: string | null;
  sperrGrund?: string | null;
  passwordHash?: string;
}

function applyUpsertToMemory(input: UpsertSessionAccountInput): KontoSicherheitsStatus {
  const key = input.id.toLowerCase();
  const bestehend = kontenRegister.get(key);
  const email = input.email || bestehend?.email || input.id;
  const gesperrtAm =
    input.gesperrtAm === null || input.gesperrtAm === ""
      ? undefined
      : input.gesperrtAm !== undefined
        ? input.gesperrtAm
        : bestehend?.gesperrtAm;
  const sperrGrund =
    input.sperrGrund === null || input.sperrGrund === ""
      ? undefined
      : input.sperrGrund !== undefined
        ? input.sperrGrund
        : bestehend?.sperrGrund;
  const aktualisiert: KontoSicherheitsStatus = {
    id: input.id,
    name: input.name ?? bestehend?.name ?? (email.split("@")[0] || "Nutzer"),
    email,
    role: input.role ?? bestehend?.role ?? "berater",
    roles: input.roles ?? bestehend?.roles,
    teamId: input.teamId ?? bestehend?.teamId,
    teamName: input.teamName ?? bestehend?.teamName,
    partnerStatus: input.partnerStatus ?? bestehend?.partnerStatus,
    permissions: input.permissions ? sanitizePermissions(input.permissions) : (bestehend?.permissions ?? []),
    sitzungsVersion: input.sitzungsVersion ?? bestehend?.sitzungsVersion ?? 1,
    gesperrtAm,
    sperrGrund,
  };
  kontenRegister.set(key, aktualisiert);
  return aktualisiert;
}

export function upsertSessionAccount(input: UpsertSessionAccountInput): KontoSicherheitsStatus {
  const aktualisiert = applyUpsertToMemory(input);
  void persistKontoInBackground(aktualisiert, input.passwordHash).catch(() => undefined);
  return aktualisiert;
}

export async function upsertSessionAccountAsync(input: UpsertSessionAccountInput): Promise<KontoSicherheitsStatus> {
  await getKontoAsync(input.id);
  const konto = applyUpsertToMemory(input);
  await persistKontoInBackground(konto, input.passwordHash);
  return konto;
}

export function getKonto(id: string): KontoSicherheitsStatus | undefined {
  return kontenRegister.get(id.toLowerCase());
}

export async function getKontoAsync(id: string): Promise<KontoSicherheitsStatus | undefined> {
  const key = id.toLowerCase();
  const cached = kontenRegister.get(key);
  if (cached) return cached;
  const fromDb = await SqlUsersRepo.getById(id);
  if (!fromDb) return undefined;
  const konto = recordToKonto(fromDb);
  kontenRegister.set(key, konto);
  return konto;
}

/**
 * Echtzeit-Kontosperre (`gesperrtAm`): Sofort beim nächsten Request in `proxy.ts` / `getSessionUser` wirksam (0 Sek. Latenz).
 */
export async function sperreKonto(id: string, grund = "Verstoß gegen die Sicherheitsrichtlinien"): Promise<void> {
  const key = id.toLowerCase();
  const konto = (await getKontoAsync(id)) ?? kontenRegister.get(key);
  if (konto) {
    const gesperrt: KontoSicherheitsStatus = {
      ...konto,
      gesperrtAm: new Date().toISOString(),
      sperrGrund: grund,
    };
    kontenRegister.set(key, gesperrt);
    await persistKontoInBackground(gesperrt);
  } else {
    await upsertSessionAccountAsync({
      id,
      email: id,
      gesperrtAm: new Date().toISOString(),
      sperrGrund: grund,
    });
  }
  await Sitzungswachdienst.widerrufeAlleFuerInhaber(id, `Konto gesperrt: ${grund}`);
}

/**
 * Hebt eine aktive Kontosperre (`gesperrtAm` / `sperrGrund`) im L1-Register und in PostgreSQL sofort auf.
 */
export async function entsperreKonto(id: string): Promise<void> {
  const key = id.toLowerCase();
  const konto = (await getKontoAsync(id)) ?? kontenRegister.get(key);
  if (konto) {
    const entsperrt: KontoSicherheitsStatus = {
      ...konto,
      gesperrtAm: undefined,
      sperrGrund: undefined,
    };
    kontenRegister.set(key, entsperrt);
    await persistKontoInBackground(entsperrt);
  } else {
    await upsertSessionAccountAsync({
      id,
      email: id,
      gesperrtAm: null,
      sperrGrund: null,
    });
  }
  await Sitzungswachdienst.reaktiviereFuerInhaber(id);
}

/**
 * Erhöht `sitzungsVersion` (z. B. nach Passwort-Reset oder Sicherheitsvorfall) und macht alle bisherigen Cookies sofort ungültig.
 */
export async function erhoeheSitzungsVersion(id: string): Promise<number> {
  const key = id.toLowerCase();
  const konto = (await getKontoAsync(id)) ?? kontenRegister.get(key);
  const neueVersion = (konto?.sitzungsVersion ?? 1) + 1;
  if (konto) {
    const aktualisiert: KontoSicherheitsStatus = { ...konto, sitzungsVersion: neueVersion };
    kontenRegister.set(key, aktualisiert);
    await persistKontoInBackground(aktualisiert);
  }
  await Sitzungswachdienst.widerrufeAlleFuerInhaber(id, "Sitzungsversion erhöht (Passwort/Sicherheit geändert)");
  return neueVersion;
}

export function leereKontenL1Cache(): void {
  kontenRegister.clear();
}

export function resetKontenFuerTests(): void {
  kontenRegister.clear();
  clearMemoryStores();
}

/**
 * Einheitliche Sitzungsauflösung (`getSessionUser(req)`) gemäß Pycie Zero-Trust Standard:
 * 1. Liest das signierte Session-Cookie (`__Host-vf_session` / `vf_session`)
 * 2. Prüft Konto-Sperre (`gesperrtAm` -> `banned: true`) und `sitzungsVersion` in Echtzeit (L1 + Hybrid-DB)
 * 3. Prüft `Sitzungswachdienst` (Geräte-Bindung `userAgentHash`, Ablauf & Token-Reuse-Erkennung)
 * 4. Berechnet granulare Capabilities (`permissions: Permission[]`) über `effectiveUserPermissions`
 */
export async function getSessionUser(req: Request, nowMs = Date.now()): Promise<SessionUser | null> {
  const ua = req.headers.get("user-agent") ?? undefined;
  const rawToken =
    readCookie(req, VF_SESSION_COOKIE) ??
    readCookie(req, "__Host-vf_session") ??
    readCookie(req, "vf_session");

  if (rawToken) {
    const daten = readSessionToken(rawToken, nowMs);
    if (!daten) return null;

    const konto = await getKontoAsync(daten.id);
    if (!konto) return null;

    if (konto.gesperrtAm) {
      return {
        id: konto.id,
        name: konto.name,
        email: konto.email,
        role: konto.role,
        roles: konto.roles,
        teamId: konto.teamId,
        teamName: konto.teamName,
        banned: true,
        banReason: konto.sperrGrund ?? "Dieses Konto ist gesperrt.",
        sessionId: daten.sessionId,
        sitzungsVersion: konto.sitzungsVersion,
        permissions: [],
      };
    }

    if (konto.sitzungsVersion !== daten.version) return null;

    const pruefung = await Sitzungswachdienst.pruefeUndAktualisiere(daten.sessionId, daten.tokenId, ua, false, nowMs);
    if (!pruefung.gueltig) return null;

    return {
      id: konto.id,
      name: konto.name,
      email: konto.email,
      role: konto.role,
      roles: konto.roles,
      teamId: konto.teamId,
      teamName: konto.teamName,
      banned: false,
      sessionId: daten.sessionId,
      sitzungsVersion: konto.sitzungsVersion,
      permissions: effectiveUserPermissions(konto),
    };
  }

  // Lokaler Entwicklungs-Fallback für den Demo-Admin-Zugang (nur wenn NODE_ENV === "development")
  if (DEMO_LOGIN_ENABLED && readCookie(req, VF_DEMO_COOKIE) === "1") {
    return {
      id: DEMO_ADMIN.id,
      name: DEMO_ADMIN.name ?? "Demo Admin",
      email: DEMO_ADMIN.email,
      role: DEMO_ADMIN.role,
      banned: false,
      sessionId: "demo-session",
      sitzungsVersion: 1,
      permissions: effectiveUserPermissions(DEMO_ADMIN),
    };
  }

  return null;
}
