import type { AntiCopyReport, Honeypot, Intruder } from "./securityThreatTypes";

/** Beispieldaten für Kopierschutz und Honeypot, relativ zu jetzt. */
const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const at = (now: number, ago: number) => new Date(now - ago).toISOString();

export function demoAntiCopy(now: number): AntiCopyReport {
  return {
    stats: { tracked: 148, suspicious: 4, blocked: 1, warned: 3, honeypotHits: 5 },
    threats: [
      {
        ip: "45.155.205.233",
        score: 92,
        blocked: true,
        blockReason: "Automatisierte Abfrage aller Türen (Scraper)",
        userAgent: "python-requests/2.32",
        firstSeen: at(now, 9 * HOUR),
        lastSeen: at(now, 7 * HOUR),
        totalEvents: 38,
        requestsLast5Min: 0,
        uniqueEndpoints: 41,
        events: [
          { type: "RAPID_ENUMERATION", severity: "HIGH", details: "212 Türen in 60 Sekunden abgefragt", time: at(now, 7 * HOUR + 5 * MIN) },
          { type: "BOT_SIGNATURE", severity: "CRITICAL", details: "User-Agent python-requests", time: at(now, 7 * HOUR) },
        ],
      },
      {
        ip: "91.64.12.188",
        userId: "n4",
        score: 46,
        blocked: false,
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_3)",
        firstSeen: at(now, 3 * HOUR),
        lastSeen: at(now, 2 * MIN),
        totalEvents: 9,
        requestsLast5Min: 140,
        uniqueEndpoints: 12,
        events: [{ type: "BULK_EXPORT", severity: "MEDIUM", details: "Kundenliste dreimal hintereinander geöffnet", time: at(now, 6 * MIN) }],
      },
      {
        ip: "88.130.4.17",
        userId: "n1",
        score: 24,
        blocked: false,
        firstSeen: at(now, 5 * HOUR),
        lastSeen: at(now, 12 * MIN),
        totalEvents: 3,
        requestsLast5Min: 22,
        uniqueEndpoints: 7,
        events: [{ type: "NEW_DEVICE_DETECTED", severity: "LOW", details: "Neues Gerät für Sven Krüger", time: at(now, 5 * HOUR) }],
      },
      {
        ip: "77.183.90.12",
        score: 12,
        blocked: false,
        firstSeen: at(now, 50 * MIN),
        lastSeen: at(now, 20 * MIN),
        totalEvents: 1,
        requestsLast5Min: 4,
        uniqueEndpoints: 3,
        events: [{ type: "SUSPICIOUS_ACTIVITY", severity: "LOW", details: "Rechtsklick-Speichern auf der Karte", time: at(now, 20 * MIN) }],
      },
    ],
    sessions: [
      { userId: "n4", email: "emma@demo.local", ips: ["91.64.12.188", "176.4.90.21"] },
      { userId: "n1", email: "sven@demo.local", ips: ["88.130.4.17"] },
      { userId: "s1", email: "deniz@demo.local", ips: ["92.211.5.140"] },
      { userId: "s2", email: "clara@demo.local", ips: ["91.20.77.5"] },
      { userId: "demo-admin", email: "admin@demo.local", ips: ["84.140.22.10"] },
    ],
    multiLogins: [
      { userId: "n4", email: "emma@demo.local", ips: ["91.64.12.188", "176.4.90.21"], timestamp: at(now, 14 * MIN) },
      { userId: "s4", email: "ella@demo.local", ips: ["2.207.33.9", "109.43.51.7", "176.6.12.80"], timestamp: at(now, 2 * DAY) },
    ],
    devices: [
      {
        userId: "n4",
        email: "emma@demo.local",
        devices: [
          { fingerprint: "fp_7c41e2a9", ip: "91.64.12.188", firstSeen: at(now, 40 * DAY), lastSeen: at(now, 2 * MIN) },
          { fingerprint: "fp_19bd03f4", ip: "176.4.90.21", firstSeen: at(now, 14 * MIN), lastSeen: at(now, 8 * MIN) },
        ],
      },
      { userId: "n1", email: "sven@demo.local", devices: [{ fingerprint: "fp_a2e5c871", ip: "88.130.4.17", firstSeen: at(now, 5 * HOUR), lastSeen: at(now, 12 * MIN) }] },
    ],
    terms: [
      { userId: "s4", email: "ella@demo.local", ip: "2.207.33.9", timestamp: at(now, 6 * HOUR) },
      { userId: "s2", email: "clara@demo.local", ip: "91.20.77.5", timestamp: at(now, 3 * DAY) },
      { userId: "n5", email: "paul@demo.local", ip: "79.234.18.201", timestamp: at(now, 8 * DAY) },
    ],
  };
}

type IntruderSeed = [id: string, ago: number, ip: string, path: string, device: string, browser: string, os: string, country: string, code: string, city: string, isp: string, file?: string, reported?: boolean];

const INTRUDERS: readonly IntruderSeed[] = [
  ["h1", 5 * HOUR, "162.243.140.17", "/admin/backup.zip", "Desktop", "curl", "Linux", "USA", "US", "New York", "DigitalOcean", "json"],
  ["h2", 22 * HOUR, "45.155.205.233", "/api/export/kunden.xlsx", "Desktop", "Python", "Linux", "Russland", "RU", "Moskau", "Partner LLC", "xlsx"],
  ["h3", 2 * DAY, "194.26.29.120", "/wp-login.php", "Desktop", "Chrome 120", "Windows", "Niederlande", "NL", "Rotterdam", "Chang Way Technologies"],
  ["h4", 4 * DAY, "141.98.11.73", "/.env", "Desktop", "Go-http-client", "Linux", "Litauen", "LT", "Vilnius", "UAB Host Baltic", undefined, true],
  ["h5", 9 * DAY, "37.120.204.18", "/provisionen_alle_2026.xlsx", "Mobile", "Safari", "iOS", "Deutschland", "DE", "Frankfurt", "M247 Europe", "xlsx", true],
];

export function demoHoneypot(now: number): Honeypot {
  const intruders: Intruder[] = INTRUDERS.map(([id, ago, ip, path, deviceType, browser, os, country, countryCode, city, isp, file, reported]) => ({
    id,
    ip,
    path,
    deviceType,
    browser,
    os,
    country,
    countryCode,
    city,
    isp,
    fileServed: Boolean(file),
    fileType: file ?? "",
    reported: reported === true,
    reportedAt: reported ? at(now, ago - HOUR) : undefined,
    timestamp: at(now, ago),
  }));
  return {
    stats: {
      total: intruders.length,
      uniqueIPs: new Set(intruders.map((i) => i.ip)).size,
      uniqueCountries: new Set(intruders.map((i) => i.countryCode)).size,
      canaryDownloads: intruders.filter((i) => i.fileServed).length,
      reported: intruders.filter((i) => i.reported).length,
    },
    intruders,
  };
}
