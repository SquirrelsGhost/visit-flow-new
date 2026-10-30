import type { AlertSeverity, AuditEntry, AuditFilter, BlockCategory, BlockedIp, BlockGroup, HealthLevel, SecurityAlert, SecuritySnapshot, ThreatLevel } from "./securityTypes";

/** Reihenfolge der Liste wie der v1-Server: echte Nutzer zuerst (Fehlalarme prüfen), klare Angreifer unten. */
const PRIORITY: Record<BlockCategory, number> = { real_user: 0, rate_limit: 1, manual: 2, scraper: 3, severe: 4, honeypot: 5 };

const GROUP_MATCH: Record<BlockGroup, (c: BlockCategory) => boolean> = {
  all: () => true,
  suspicious: (c) => c === "real_user" || c === "rate_limit",
  scrapers: (c) => c === "scraper" || c === "severe",
  honeypot: (c) => c === "honeypot",
  manual: (c) => c === "manual",
};

export const inGroup = (group: BlockGroup, category: BlockCategory) => GROUP_MATCH[group](category);

export function sortBlacklist(list: readonly BlockedIp[]): BlockedIp[] {
  return [...list].sort((a, b) => PRIORITY[a.category] - PRIORITY[b.category] || b.blockedAt - a.blockedAt);
}

const contains = (query: string, ...values: (string | undefined)[]) => values.some((v) => v?.toLowerCase().includes(query));

/** Blacklist nach Gruppe und Suche (IP, E-Mail, Land, Stadt, Anbieter, Grund). */
export function filterBlacklist(list: readonly BlockedIp[], group: BlockGroup, query: string): BlockedIp[] {
  const q = query.trim().toLowerCase();
  return sortBlacklist(list.filter((b) => inGroup(group, b.category) && (!q || contains(q, b.ip, b.email, b.country, b.city, b.isp, b.reason))));
}

export function groupCounts(list: readonly BlockedIp[]): Record<BlockGroup, number> {
  const count = (g: BlockGroup) => list.filter((b) => inGroup(g, b.category)).length;
  return { all: list.length, suspicious: count("suspicious"), scrapers: count("scrapers"), honeypot: count("honeypot"), manual: count("manual") };
}

/** Nur IPv4 wie die v1-Endpunkte (Sperren, Whitelist). */
export function isValidIpv4(ip: string): boolean {
  const parts = ip.trim().split(".");
  return parts.length === 4 && parts.every((p) => /^\d{1,3}$/.test(p) && Number(p) <= 255);
}

export const openAlerts = (alerts: readonly SecurityAlert[]) => alerts.filter((a) => !a.acknowledged);

/**
 * Sicherheitswert 0–100 wie v1 SecurityOverview: je gesperrter IP −2 (max. −20), je Login-Sperre −5 (max. −25),
 * je offenem Alarm −3 (max. −15). v1 nahm für Sperren und Alarme Beispielwerte, hier zählen die echten Daten.
 */
export function healthScore(s: Pick<SecuritySnapshot, "firewall" | "login" | "alerts">): number {
  let score = 100;
  score -= Math.min((s.firewall?.blockedIPs ?? 0) * 2, 20);
  score -= Math.min((s.login?.activeLocks ?? 0) * 5, 25);
  score -= Math.min(openAlerts(s.alerts ?? []).length * 3, 15);
  return Math.max(0, Math.min(100, score));
}

export function healthLevel(score: number): HealthLevel {
  if (score >= 90) return "excellent";
  if (score >= 70) return "good";
  if (score >= 50) return "warning";
  return "critical";
}

/** Gefahrenstufe des Kopierschutz-Werts (v1 getScoreColor: ab 75 rot, 40 orange, 20 gelb). */
export function threatLevel(score: number): ThreatLevel {
  if (score >= 75) return "high";
  if (score >= 40) return "elevated";
  if (score >= 20) return "watch";
  return "low";
}

const SEVERITY_RANK: Record<AlertSeverity, number> = { CRITICAL: 0, WARNING: 1, INFO: 2 };

/** Offene Alarme zuerst, darin kritische vor Warnungen, sonst neueste oben. */
export function sortAlerts(alerts: readonly SecurityAlert[]): SecurityAlert[] {
  return [...alerts].sort(
    (a, b) => Number(a.acknowledged) - Number(b.acknowledged) || SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] || b.timestamp.localeCompare(a.timestamp),
  );
}

/** Letzter ernster Vorfall: neuester Warn- oder kritischer Alarm oder die jüngste Sperre. */
export function lastIncident(s: Pick<SecuritySnapshot, "alerts" | "blacklist">): number | null {
  const times = [
    ...(s.alerts ?? []).filter((a) => a.severity !== "INFO").map((a) => Date.parse(a.timestamp)),
    ...(s.blacklist ?? []).map((b) => b.blockedAt),
  ].filter((t) => Number.isFinite(t));
  return times.length ? Math.max(...times) : null;
}

export type Age = { unit: "now" | "min" | "h" | "d"; n: number };

/** Abstand zu jetzt in der gröbsten sinnvollen Einheit (v1 formatTime im Honeypot-Panel). */
export function ageOf(time: number, now: number): Age {
  const minutes = Math.floor(Math.max(0, now - time) / 60_000);
  if (minutes < 1) return { unit: "now", n: 0 };
  if (minutes < 60) return { unit: "min", n: minutes };
  if (minutes < 60 * 24) return { unit: "h", n: Math.floor(minutes / 60) };
  return { unit: "d", n: Math.floor(minutes / (60 * 24)) };
}

/** Restliche Minuten einer Sperre, aufgerundet; 0 = abgelaufen. */
export const minutesLeft = (until: number, now: number) => Math.max(0, Math.ceil((until - now) / 60_000));

/** Protokoll nach Bereich und Suche (Akteur, Aktion, Ziel, IP); im Live-Betrieb filtert der Server zusätzlich. */
export function filterAudit(logs: readonly AuditEntry[], filter: AuditFilter): AuditEntry[] {
  const q = filter.query.trim().toLowerCase();
  return logs
    .filter((l) => (filter.category === "all" || l.category === filter.category) && (!q || contains(q, l.actorEmail, l.actorName, l.action, l.targetId, l.actorIp)))
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

/** Aktionsname lesbar machen: IP_UNLOCKED → IP Unlocked (wie v1 formatAction). */
export const formatAction = (action: string) =>
  action.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).replace(/\bIp\b/g, "IP");

/** Länderflagge aus dem ISO-Code (der v1-Server schickt sie mit, alte Einträge nicht). */
export function countryFlag(code: string | undefined): string {
  if (!code || !/^[A-Za-z]{2}$/.test(code)) return "🏳️";
  return String.fromCodePoint(...[...code.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

const csvCell = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;

/** CSV der Einträge, wenn der Server-Export nicht erreichbar ist (Demo, Funkloch). */
export function auditCsv(logs: readonly AuditEntry[]): string {
  const head = ["Zeit", "Bereich", "Aktion", "Akteur", "IP", "Ziel"];
  const rows = logs.map((l) => [l.timestamp, l.category, l.action, l.actorEmail ?? "", l.actorIp, [l.targetType, l.targetId].filter(Boolean).join(" ")]);
  return [head, ...rows].map((row) => row.map(csvCell).join(";")).join("\n");
}
