import { hasDemoSession } from "../auth/demoSession";
import { legacyRequest, messageOf, type LegacyBody } from "../battle/legacyRequest";
import { listIn } from "../overview/teamApi";
import { demoAuditLogs, demoSnapshot, demoWait } from "./securityDemoStore";
import { filterAudit } from "./securityLogic";
import { toAlert, toAudit, toBlockedAccounts, toBlockedIp, toLogin, toWhitelist, type Raw } from "./securityNormalize";
import { toAntiCopy, toHoneypot } from "./securityNormalizeThreats";
import { AUDIT_LIMIT, type AuditEntry, type AuditFilter, type FirewallStats, type SecuritySnapshot } from "./securityTypes";

/**
 * Lesen über die v1-Endpunkte (alle nur für Admins): /security/ddos/stats + /blacklist, /security/whitelist,
 * /security/login-attempts, /security/alerts, /security/honeypot/intruders, /admin/suspicious-activity und
 * /admin/users (gesperrte Konten). Jeder Teil lädt für sich; fällt einer aus, bleibt der Rest sichtbar.
 */
async function body(path: string): Promise<LegacyBody> {
  const res = await legacyRequest(path);
  if (!res.success) throw new Error(messageOf(res) || path);
  return res;
}

const settled = <T>(result: PromiseSettledResult<T>): T | null => (result.status === "fulfilled" ? result.value : null);

export async function loadSnapshot(): Promise<SecuritySnapshot> {
  if (hasDemoSession()) return demoWait().then(() => demoSnapshot());
  const results = await Promise.allSettled([
    body("/security/ddos/stats").then((b) => b.stats as FirewallStats),
    body("/security/ddos/blacklist").then((b) => listIn(b, "blacklist").map(toBlockedIp)),
    body("/security/whitelist").then((b) => listIn(b, "whitelist").map(toWhitelist)),
    body("/security/login-attempts").then((b) => toLogin((b.stats ?? {}) as Raw)),
    body("/security/alerts?limit=100").then((b) => listIn(b, "alerts").map(toAlert)),
    body("/admin/suspicious-activity").then((b) => toAntiCopy(b)),
    body("/security/honeypot/intruders?limit=100").then((b) => toHoneypot(b)),
    body("/admin/users").then((b) => toBlockedAccounts(listIn(b, "users", "data"))),
  ]);
  const [firewall, blacklist, whitelist, login, alerts, antiCopy, honeypot, accounts] = results;
  const snapshot: SecuritySnapshot = {
    firewall: settled(firewall),
    blacklist: settled(blacklist),
    whitelist: settled(whitelist),
    login: settled(login),
    alerts: settled(alerts),
    antiCopy: settled(antiCopy),
    honeypot: settled(honeypot),
    accounts: settled(accounts),
    loadedAt: new Date().toISOString(),
  };
  if (results.every((r) => r.status === "rejected")) throw new Error(firstError(results));
  return snapshot;
}

const firstError = (results: PromiseSettledResult<unknown>[]) => {
  const failed = results.find((r): r is PromiseRejectedResult => r.status === "rejected");
  return failed?.reason instanceof Error ? failed.reason.message : "";
};

/**
 * Audit-Protokoll (v1 GET /security/audit-log + /count). Der Server filtert nach Bereich und Akteur-E-Mail,
 * liefert höchstens 100 Einträge und überspringt keine Seiten (skip wird in v1 nicht weitergereicht).
 */
export async function loadAudit(filter: AuditFilter): Promise<{ logs: AuditEntry[]; total: number }> {
  if (hasDemoSession()) {
    await demoWait(260);
    const logs = filterAudit(demoAuditLogs(), filter);
    return { logs, total: logs.length };
  }
  const params = new URLSearchParams({ limit: String(AUDIT_LIMIT) });
  if (filter.category !== "all") params.set("category", filter.category);
  if (filter.query.includes("@")) params.set("actorEmail", filter.query.trim());
  const [list, count] = await Promise.all([body(`/security/audit-log?${params}`), legacyRequest(`/security/audit-log/count?${params}`)]);
  const logs = filterAudit(listIn(list, "logs").map(toAudit), filter);
  return { logs, total: count.success && typeof count.count === "number" ? count.count : logs.length };
}
