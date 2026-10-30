import { demoDirectory } from "../teams/orgDemoData";
import { demoAlerts, demoAudit, demoBlacklist, demoLogin, demoWhitelist } from "./securityDemoData";
import { demoAntiCopy, demoHoneypot } from "./securityDemoThreats";
import type { AuditEntry, BlockedIp, SecuritySnapshot, WhitelistEntry } from "./securityTypes";

/** Was ein Admin in der Demo geändert hat; der Tab merkt es sich bis zum Schließen. */
const KEY = "vf_security_demo";

interface DemoChanges {
  unblocked: string[];
  blocked: BlockedIp[];
  whitelistAdded: WhitelistEntry[];
  whitelistRemoved: string[];
  unlocked: string[];
  acknowledged: string[];
  reported: string[];
  deletedLogs: string[];
  /** Einträge älter als dieser Zeitpunkt (ms) sind bereinigt. */
  cleanupBefore?: number;
  threatsCleared: string[];
  accountsUnblocked: string[];
}

const EMPTY: DemoChanges = { unblocked: [], blocked: [], whitelistAdded: [], whitelistRemoved: [], unlocked: [], acknowledged: [], reported: [], deletedLogs: [], threatsCleared: [], accountsUnblocked: [] };

function read(): DemoChanges {
  try {
    return { ...EMPTY, ...(JSON.parse(window.sessionStorage.getItem(KEY) ?? "{}") as Partial<DemoChanges>) };
  } catch {
    return EMPTY;
  }
}

/** Änderung übernehmen und speichern; ohne Speicher gilt sie nur bis zum Neuladen der Seite. */
export function demoChange(update: (c: DemoChanges) => Partial<DemoChanges>): void {
  const current = read();
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify({ ...current, ...update(current) }));
  } catch {
    // nichts zu tun
  }
}

export const demoWait = (ms = 380) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Gesperrte Konten der Demo kommen aus dem Beispiel-Verzeichnis (Lina Hartmann ist dort gesperrt). */
function demoAccounts(c: DemoChanges) {
  return demoDirectory()
    .users.filter((u) => u.isBlocked && !c.accountsUnblocked.includes(u.id))
    .map((u) => ({ id: u.id, name: u.name, email: u.email ?? "", role: u.role, reason: "Zahlungsverzug seit 14 Tagen" }));
}

export function demoSnapshot(now = Date.now()): SecuritySnapshot {
  const c = read();
  const blacklist = [...c.blocked, ...demoBlacklist(now)].filter((b) => !c.unblocked.includes(b.ip));
  const whitelist = [...c.whitelistAdded, ...demoWhitelist(now)].filter((w) => !c.whitelistRemoved.includes(w.ip));
  const login = demoLogin(now);
  const locks = login.locks.filter((l) => !c.unlocked.includes(l.ip));
  const antiCopy = demoAntiCopy(now);
  const honeypot = demoHoneypot(now);
  const intruders = honeypot.intruders.map((i) => (c.reported.includes(i.id) ? { ...i, reported: true, reportedAt: i.reportedAt ?? new Date(now).toISOString() } : i));
  const permanent = blacklist.filter((b) => b.isPermanent).length;
  return {
    firewall: { activeIPs: 37, blockedIPs: blacklist.length, permanentBlocks: permanent, temporaryBlocks: blacklist.length - permanent },
    blacklist,
    whitelist,
    login: { ...login, activeLocks: locks.length, locks },
    alerts: demoAlerts(now).map((a) => (c.acknowledged.includes(a.id) ? { ...a, acknowledged: true, acknowledgedAt: a.acknowledgedAt ?? new Date(now).toISOString() } : a)),
    antiCopy: {
      ...antiCopy,
      threats: antiCopy.threats.map((t) => (c.threatsCleared.includes(t.ip) ? { ...t, blocked: false, score: 0, events: [], blockReason: undefined } : t)),
    },
    honeypot: { stats: { ...honeypot.stats, reported: intruders.filter((i) => i.reported).length }, intruders },
    accounts: demoAccounts(c),
    loadedAt: new Date(now).toISOString(),
  };
}

export function demoAuditLogs(now = Date.now()): AuditEntry[] {
  const c = read();
  return demoAudit(now).filter((l) => !c.deletedLogs.includes(l.id) && (!c.cleanupBefore || Date.parse(l.timestamp) >= c.cleanupBefore));
}

export function resetDemoSecurity(): void {
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    // nichts zu tun
  }
}
