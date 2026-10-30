import { describe, expect, it } from "vitest";
import { demoBlacklist } from "../lib/security/securityDemoData";
import { ageOf, auditCsv, countryFlag, filterBlacklist, groupCounts, healthLevel, healthScore, isValidIpv4, lastIncident, minutesLeft, sortAlerts, threatLevel } from "../lib/security/securityLogic";
import { toAudit, toBlockedAccounts, toBlockedIp, toLogin } from "../lib/security/securityNormalize";
import { toAntiCopy } from "../lib/security/securityNormalizeThreats";
import type { SecurityAlert } from "../lib/security/securityTypes";

const NOW = Date.parse("2026-10-24T20:00:00Z");
const alert = (id: string, severity: SecurityAlert["severity"], acknowledged: boolean, timestamp: string): SecurityAlert => ({ id, type: "X", severity, message: "", timestamp, acknowledged });

describe("Sicherheitswert wie v1 SecurityOverview", () => {
  it("zieht je Sperre, Login-Sperre und offenem Alarm ab, jeweils gedeckelt", () => {
    const firewall = { activeIPs: 0, blockedIPs: 3, permanentBlocks: 0, temporaryBlocks: 0 };
    const login = { activeLocks: 2, activeAttempts: 0, locks: [] };
    const alerts = [alert("a", "CRITICAL", false, ""), alert("b", "INFO", true, "")];
    expect(healthScore({ firewall, login, alerts })).toBe(100 - 6 - 10 - 3);
    expect(healthScore({ firewall: { ...firewall, blockedIPs: 50 }, login: { ...login, activeLocks: 9 }, alerts: Array(9).fill(alerts[0]) })).toBe(40);
    expect(healthScore({ firewall: null, login: null, alerts: null })).toBe(100);
  });

  it("ordnet den Wert in vier Stufen ein", () => {
    expect([95, 90, 75, 55, 10].map(healthLevel)).toEqual(["excellent", "excellent", "good", "warning", "critical"]);
    expect([80, 50, 25, 5].map(threatLevel)).toEqual(["high", "elevated", "watch", "low"]);
  });
});

describe("Firewall-Liste", () => {
  const list = demoBlacklist(NOW);

  it("zählt Gruppen wie die v1-Filter und sortiert echte Nutzer nach oben", () => {
    expect(groupCounts(list)).toEqual({ all: 8, suspicious: 2, scrapers: 3, honeypot: 2, manual: 1 });
    expect(filterBlacklist(list, "all", "")[0]?.category).toBe("real_user");
    expect(filterBlacklist(list, "scrapers", "").map((b) => b.category)).toEqual(["scraper", "scraper", "severe"]);
  });

  it("sucht in IP, E-Mail, Ort, Anbieter und Grund", () => {
    expect(filterBlacklist(list, "all", "emma@").map((b) => b.ip)).toEqual(["91.64.12.188"]);
    expect(filterBlacklist(list, "all", "digitalocean")).toHaveLength(2);
  });

  it("prüft IPv4 wie der v1-Server", () => {
    expect(isValidIpv4("203.0.113.7")).toBe(true);
    expect(isValidIpv4(" 10.0.0.1 ")).toBe(true);
    expect(isValidIpv4("256.1.1.1")).toBe(false);
    expect(isValidIpv4("::1")).toBe(false);
  });
});

describe("Zeiten und Alarme", () => {
  it("rechnet Abstände in die gröbste Einheit und Restminuten auf", () => {
    expect(ageOf(NOW - 20_000, NOW)).toEqual({ unit: "now", n: 0 });
    expect(ageOf(NOW - 5 * 60_000, NOW)).toEqual({ unit: "min", n: 5 });
    expect(ageOf(NOW - 3 * 3_600_000, NOW)).toEqual({ unit: "h", n: 3 });
    expect(ageOf(NOW - 50 * 3_600_000, NOW)).toEqual({ unit: "d", n: 2 });
    expect(minutesLeft(NOW + 61_000, NOW)).toBe(2);
    expect(minutesLeft(NOW - 1, NOW)).toBe(0);
  });

  it("zeigt offene vor bestätigten und kritische vor Warnungen", () => {
    const sorted = sortAlerts([alert("info", "INFO", false, "2026-10-24T19:00:00Z"), alert("done", "CRITICAL", true, "2026-10-24T19:59:00Z"), alert("crit", "CRITICAL", false, "2026-10-24T18:00:00Z")]);
    expect(sorted.map((a) => a.id)).toEqual(["crit", "info", "done"]);
  });

  it("nimmt als letzten Vorfall den neuesten ernsten Alarm oder die jüngste Sperre", () => {
    const blacklist = demoBlacklist(NOW);
    expect(lastIncident({ alerts: [], blacklist })).toBe(NOW - 18 * 60_000);
    expect(lastIncident({ alerts: [alert("a", "INFO", false, new Date(NOW).toISOString())], blacklist: [] })).toBeNull();
  });
});

describe("Rohdaten der v1-API", () => {
  it("liest Blacklist-Einträge mit Ersatz für alte Zeilen ohne Kategorie", () => {
    const b = toBlockedIp({ ip: "1.2.3.4", blockedAt: NOW, blockedUntil: "PERMANENT_NOT_A_DATE", lastAttemptedEmail: "x@y.de" });
    expect(b).toMatchObject({ ip: "1.2.3.4", category: "rate_limit", email: "x@y.de", isPermanent: true });
  });

  it("liest Login-Sperren neueste zuerst", () => {
    const login = toLogin({ activeLocks: 2, activeAttempts: 1, locks: [{ ip: "a", lockedAt: 1 }, { ip: "b", lockedAt: 2 }] });
    expect(login.locks.map((l) => l.ip)).toEqual(["b", "a"]);
  });

  it("nimmt E-Mail und Name aus dem befüllten actor.userId", () => {
    const entry = toAudit({ _id: "1", action: "IP_UNLOCKED", category: "SECURITY", actor: { userId: { name: "Admin", email: "a@b.de" }, ip: "system" }, target: { type: "IP", id: "1.2.3.4" }, timestamp: NOW });
    expect(entry).toMatchObject({ id: "1", actorEmail: "a@b.de", actorName: "Admin", targetId: "1.2.3.4" });
  });

  it("legt gesperrte und verdächtige IPs des Kopierschutzes zusammen", () => {
    const report = toAntiCopy({ stats: { totalTracked: 3 }, blocked: [{ ip: "b", score: 80, blocked: true }], suspicious: [{ ip: "s", score: 90 }], multiLoginAlerts: [{ email: "old" }, { email: "new" }] });
    expect(report.threats.map((x) => x.ip)).toEqual(["b", "s"]);
    expect(report.multiLogins.map((m) => m.email)).toEqual(["new", "old"]);
    expect(report.stats.tracked).toBe(3);
  });

  it("filtert gesperrte Konten aus der Nutzerliste", () => {
    expect(toBlockedAccounts([{ _id: "1", name: "A", isBlocked: true, blockReason: "Zahlung" }, { _id: "2", name: "B" }])).toEqual([{ id: "1", name: "A", email: "", role: "berater", reason: "Zahlung", until: undefined }]);
  });
});

describe("Hilfen", () => {
  it("baut Flaggen aus dem Ländercode und CSV mit Semikolon", () => {
    expect(countryFlag("de")).toBe("🇩🇪");
    expect(countryFlag(undefined)).toBe("🏳️");
    const csv = auditCsv([{ id: "1", action: "A", category: "ADMIN", actorIp: "1.1.1.1", actorEmail: 'x"y', timestamp: "t" }]);
    expect(csv.split("\n")[1]).toBe('"t";"ADMIN";"A";"x""y";"1.1.1.1";""');
  });
});
