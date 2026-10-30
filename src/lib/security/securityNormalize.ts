import type { AlertSeverity, AuditCategory, AuditEntry, BlockCategory, BlockedAccount, BlockedIp, LoginProtection, SecurityAlert, WhitelistEntry } from "./securityTypes";

/** Rohantworten der v1-API in feste Formen bringen; fehlende Felder werden leer statt undefiniert. */
export type Raw = Record<string, unknown>;

export const str = (v: unknown) => (typeof v === "string" && v ? v : undefined);
export const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : Number(v) || 0);
export const arr = (v: unknown) => (Array.isArray(v) ? (v as Raw[]) : []);
export const strings = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);
export const iso = (v: unknown) => (typeof v === "string" ? v : typeof v === "number" || v instanceof Date ? new Date(v).toISOString() : "");
export const ms = (v: unknown) => (typeof v === "number" ? v : typeof v === "string" ? Date.parse(v) || 0 : 0);
export const obj = (v: unknown) => (v && typeof v === "object" && !Array.isArray(v) ? (v as Raw) : {});
export const idOf = (r: Raw) => String(r._id ?? r.id ?? "");

const CATEGORIES: readonly BlockCategory[] = ["real_user", "rate_limit", "manual", "scraper", "severe", "honeypot"];
const SEVERITIES: readonly AlertSeverity[] = ["INFO", "WARNING", "CRITICAL"];
const AUDIT: readonly AuditCategory[] = ["SECURITY", "ADMIN", "USER", "SYSTEM"];
const pick = <T extends string>(list: readonly T[], v: unknown, fallback: T): T => (list.includes(v as T) ? (v as T) : fallback);

export function toBlockedIp(r: Raw): BlockedIp {
  const blockedUntil = r.blockedUntil ? ms(r.blockedUntil) : undefined;
  return {
    ip: String(r.ip ?? ""),
    reason: String(r.reason ?? ""),
    category: pick(CATEGORIES, r.category, "rate_limit"),
    blockedAt: ms(r.blockedAt),
    blockedUntil,
    isPermanent: r.isPermanent === true || !blockedUntil,
    isActive: r.isActive !== false,
    requestCount: num(r.requestCount),
    violations: num(r.violations),
    email: str(r.lastAttemptedEmail) ?? str(r.email),
    wasAuthenticated: r.wasAuthenticated === true,
    userAgent: str(r.userAgent),
    country: str(r.country),
    countryCode: str(r.countryCode),
    city: str(r.city),
    isp: str(r.isp),
  };
}

export const toWhitelist = (r: Raw): WhitelistEntry => ({ ip: String(r.ip ?? ""), comment: String(r.comment ?? ""), addedAt: ms(r.addedAt), addedBy: str(r.addedBy) });

export function toLogin(r: Raw): LoginProtection {
  const locks = arr(r.locks).map((l) => ({ ip: String(l.ip ?? ""), email: String(l.email ?? ""), lockedAt: ms(l.lockedAt), lockedUntil: ms(l.lockedUntil), attemptCount: num(l.attemptCount) }));
  return { activeLocks: num(r.activeLocks ?? locks.length), activeAttempts: num(r.activeAttempts), locks: locks.sort((a, b) => b.lockedAt - a.lockedAt) };
}

export const toAlert = (r: Raw): SecurityAlert => ({
  id: idOf(r),
  type: String(r.type ?? ""),
  severity: pick(SEVERITIES, r.severity, "INFO"),
  message: String(r.message ?? ""),
  timestamp: iso(r.timestamp),
  acknowledged: r.acknowledged === true,
  acknowledgedAt: r.acknowledgedAt ? iso(r.acknowledgedAt) : undefined,
});

/** actor.userId ist in v1 mit name/email befüllt (populate) oder nur eine Id. */
export function toAudit(r: Raw): AuditEntry {
  const actor = obj(r.actor);
  const user = obj(actor.userId);
  const target = obj(r.target);
  return {
    id: idOf(r),
    action: String(r.action ?? ""),
    category: pick(AUDIT, r.category, "SYSTEM"),
    actorEmail: str(actor.email) ?? str(user.email),
    actorName: str(user.name),
    actorIp: String(actor.ip ?? ""),
    userAgent: str(actor.userAgent),
    targetType: str(target.type),
    targetId: str(target.id),
    metadata: Object.keys(obj(r.metadata)).length ? obj(r.metadata) : undefined,
    timestamp: iso(r.timestamp),
  };
}

export const toBlockedAccounts = (users: readonly Raw[]): BlockedAccount[] =>
  users
    .filter((u) => u.isBlocked === true)
    .map((u) => ({ id: idOf(u), name: String(u.name ?? u.email ?? ""), email: String(u.email ?? ""), role: String(u.role ?? "berater"), reason: str(u.blockReason), until: u.blockUntil ? iso(u.blockUntil) : undefined }));
