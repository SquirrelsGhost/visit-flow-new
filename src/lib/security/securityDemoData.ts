import type { AuditEntry, BlockedIp, LoginProtection, SecurityAlert, WhitelistEntry } from "./securityTypes";

/** Beispieldaten der Sicherheitsseite, immer relativ zu jetzt, damit Restzeiten und "vor x Min." stimmen. */
const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

type Geo = Pick<BlockedIp, "country" | "countryCode" | "city" | "isp">;
const DE = (city: string, isp: string): Geo => ({ country: "Deutschland", countryCode: "DE", city, isp });

export function demoBlacklist(now: number): BlockedIp[] {
  const base = { isActive: true, wasAuthenticated: false, isPermanent: true } as const;
  return [
    { ...base, ip: "91.64.12.188", reason: "Rate limit exceeded: 312 requests/min", category: "real_user", blockedAt: now - 18 * MIN, blockedUntil: now + 42 * MIN, isPermanent: false, requestCount: 312, violations: 2, email: "emma@demo.local", wasAuthenticated: true, ...DE("Düsseldorf", "Vodafone GmbH") },
    { ...base, ip: "88.152.7.31", reason: "Rate limit exceeded: 220 requests/min", category: "rate_limit", blockedAt: now - 2 * HOUR, blockedUntil: now + 4 * HOUR, isPermanent: false, requestCount: 220, violations: 1, ...DE("Köln", "Deutsche Telekom AG") },
    { ...base, ip: "185.220.101.44", reason: "Manuell gesperrt: Tor-Exit, wiederholte Login-Versuche", category: "manual", blockedAt: now - 3 * DAY, requestCount: 48, violations: 6, country: "Niederlande", countryCode: "NL", city: "Amsterdam", isp: "Tor Exit Node" },
    { ...base, ip: "45.155.205.233", reason: "Scraper pattern: sequential /api/doors enumeration", category: "scraper", blockedAt: now - 7 * HOUR, requestCount: 4810, violations: 14, userAgent: "python-requests/2.32", country: "Russland", countryCode: "RU", city: "Moskau", isp: "Partner LLC" },
    { ...base, ip: "103.152.118.9", reason: "Scraper pattern: headless browser", category: "scraper", blockedAt: now - 26 * HOUR, requestCount: 2290, violations: 9, userAgent: "HeadlessChrome/131", country: "Singapur", countryCode: "SG", city: "Singapur", isp: "DigitalOcean" },
    { ...base, ip: "194.26.29.120", reason: "SEVERE: SQL injection attempt", category: "severe", blockedAt: now - 2 * DAY, requestCount: 96, violations: 22, country: "Niederlande", countryCode: "NL", city: "Rotterdam", isp: "Chang Way Technologies" },
    { ...base, ip: "162.243.140.17", reason: "Honeypot: /admin/backup.zip", category: "honeypot", blockedAt: now - 5 * HOUR, requestCount: 12, violations: 3, country: "USA", countryCode: "US", city: "New York", isp: "DigitalOcean" },
    { ...base, ip: "141.98.11.73", reason: "Honeypot: /.env", category: "honeypot", blockedAt: now - 4 * DAY, requestCount: 7, violations: 2, country: "Litauen", countryCode: "LT", city: "Vilnius", isp: "UAB Host Baltic" },
  ];
}

export function demoWhitelist(now: number): WhitelistEntry[] {
  return [
    { ip: "84.140.22.10", comment: "Büro Düsseldorf", addedAt: now - 40 * DAY, addedBy: "admin@demo.local" },
    { ip: "62.157.81.4", comment: "Büro Köln", addedAt: now - 21 * DAY, addedBy: "admin@demo.local" },
    { ip: "3.120.181.40", comment: "Monitoring (Uptime-Check)", addedAt: now - 9 * DAY, addedBy: "admin@demo.local" },
  ];
}

export function demoLogin(now: number): LoginProtection {
  const locks = [
    { ip: "79.234.18.201", email: "paul@demo.local", lockedAt: now - 4 * MIN, lockedUntil: now + 11 * MIN, attemptCount: 5 },
    { ip: "193.32.162.57", email: "admin@visit-flow.de", lockedAt: now - 9 * MIN, lockedUntil: now + 6 * MIN, attemptCount: 7 },
  ];
  return { activeLocks: locks.length, activeAttempts: 4, locks };
}

const at = (now: number, ago: number) => new Date(now - ago).toISOString();

export function demoAlerts(now: number): SecurityAlert[] {
  return [
    { id: "a1", type: "BRUTE_FORCE", severity: "CRITICAL", message: "3 Konten in 10 Minuten nach Fehlversuchen gesperrt", timestamp: at(now, 9 * MIN), acknowledged: false },
    { id: "a2", type: "NEW_ADMIN_IP", severity: "WARNING", message: "Admin-Anmeldung von neuer IP 37.201.4.88 (Düsseldorf)", timestamp: at(now, 3 * HOUR), acknowledged: false },
    { id: "a3", type: "SEVERE_ATTACK", severity: "CRITICAL", message: "SQL-Injection-Versuch von 194.26.29.120 abgewehrt", timestamp: at(now, 2 * DAY), acknowledged: true, acknowledgedAt: at(now, 2 * DAY - HOUR) },
    { id: "a4", type: "DDOS_ATTACK", severity: "WARNING", message: "Lastspitze: 1.840 Anfragen/min von 31 IPs", timestamp: at(now, 3 * DAY), acknowledged: true, acknowledgedAt: at(now, 3 * DAY - 2 * HOUR) },
    { id: "a5", type: "BILLING_FAILURE", severity: "INFO", message: "Zahlung für Team Süd fehlgeschlagen, neuer Versuch geplant", timestamp: at(now, 5 * DAY), acknowledged: true },
  ];
}

type AuditSeed = [id: string, ago: number, action: string, category: AuditEntry["category"], actor: string, ip: string, target?: [string, string]];

const AUDIT: readonly AuditSeed[] = [
  ["l1", 4 * MIN, "LOGIN_LOCKED", "SECURITY", "paul@demo.local", "79.234.18.201", ["IP", "79.234.18.201"]],
  ["l2", 18 * MIN, "IP_BLOCKED", "SECURITY", "system", "system", ["IP", "91.64.12.188"]],
  ["l3", 52 * MIN, "USER_UPDATED", "ADMIN", "admin@demo.local", "84.140.22.10", ["USER", "s2"]],
  ["l4", 2 * HOUR, "LOGIN_SUCCESS", "USER", "sven@demo.local", "88.130.4.17"],
  ["l5", 3 * HOUR, "NEW_ADMIN_IP", "SECURITY", "admin@demo.local", "37.201.4.88"],
  ["l6", 5 * HOUR, "HONEYPOT_TRIGGERED", "SECURITY", "system", "162.243.140.17", ["PATH", "/admin/backup.zip"]],
  ["l7", 9 * HOUR, "WHITELIST_ADDED", "ADMIN", "admin@demo.local", "84.140.22.10", ["IP", "3.120.181.40"]],
  ["l8", 26 * HOUR, "USER_BLOCKED", "ADMIN", "admin@demo.local", "84.140.22.10", ["USER", "n6"]],
  ["l9", 30 * HOUR, "PASSWORD_CHANGED", "USER", "clara@demo.local", "91.20.77.5"],
  ["l10", 2 * DAY, "SYSTEM_SETTINGS_CHANGED", "SYSTEM", "admin@demo.local", "84.140.22.10", ["SETTING", "allowRegistration"]],
  ["l11", 3 * DAY, "IP_MANUALLY_BLOCKED", "SECURITY", "admin@demo.local", "84.140.22.10", ["IP", "185.220.101.44"]],
  ["l12", 4 * DAY, "DATA_EXPORT", "USER", "hanna@demo.local", "62.157.81.4"],
  ["l13", 6 * DAY, "BACKUP_COMPLETED", "SYSTEM", "system", "system"],
  ["l14", 12 * DAY, "ROLE_CHANGED", "ADMIN", "admin@demo.local", "84.140.22.10", ["USER", "n3"]],
];

export function demoAudit(now: number): AuditEntry[] {
  return AUDIT.map(([id, ago, action, category, actor, ip, target]) => ({
    id,
    action,
    category,
    actorEmail: actor === "system" ? undefined : actor,
    actorIp: ip,
    userAgent: actor === "system" ? undefined : "Mozilla/5.0 (iPad; CPU OS 18_4 like Mac OS X)",
    targetType: target?.[0],
    targetId: target?.[1],
    metadata: target?.[0] === "IP" ? { reason: action === "IP_BLOCKED" ? "Rate limit" : "Admin" } : undefined,
    timestamp: at(now, ago),
  }));
}
