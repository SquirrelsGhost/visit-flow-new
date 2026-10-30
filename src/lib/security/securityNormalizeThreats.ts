import type { AntiCopyReport, Honeypot, Intruder, ThreatEntity } from "./securityThreatTypes";
import { arr, idOf, iso, num, obj, str, strings, type Raw } from "./securityNormalize";

/** Vom Kopierschutz beobachtete IP. */
const toThreat = (r: Raw): ThreatEntity => ({
  ip: String(r.ip ?? ""),
  userId: str(r.userId),
  userAgent: str(r.userAgent),
  score: num(r.score),
  blocked: r.blocked === true,
  blockReason: str(r.blockReason),
  firstSeen: iso(r.firstSeen),
  lastSeen: iso(r.lastSeen),
  totalEvents: num(r.totalEvents),
  requestsLast5Min: num(r.requestsLast5Min),
  uniqueEndpoints: num(r.uniqueEndpoints),
  events: arr(r.recentEvents).map((e) => ({ type: String(e.type ?? ""), severity: String(e.severity ?? ""), details: String(e.details ?? ""), time: iso(e.time) })),
});

/** v1 GET /admin/suspicious-activity: verdächtige und gesperrte IPs zusammen, nach Wert sortiert. */
export function toAntiCopy(r: Raw): AntiCopyReport {
  const s = obj(r.stats);
  return {
    stats: { tracked: num(s.totalTracked), suspicious: num(s.totalSuspicious), blocked: num(s.totalBlocked), warned: num(s.totalWarned), honeypotHits: num(s.totalHoneypotHits) },
    threats: [...arr(r.blocked), ...arr(r.suspicious)].map(toThreat).sort((a, b) => Number(b.blocked) - Number(a.blocked) || b.score - a.score),
    sessions: arr(r.activeSessions).map((x) => ({ userId: String(x.userId ?? ""), email: String(x.email ?? ""), ips: strings(x.activeIPs) })),
    multiLogins: arr(r.multiLoginAlerts).map((x) => ({ userId: String(x.userId ?? ""), email: String(x.email ?? ""), ips: strings(x.ips), timestamp: iso(x.timestamp) })).reverse(),
    devices: arr(r.deviceBindings).map((b) => ({
      userId: String(b.userId ?? ""),
      email: String(b.email ?? ""),
      devices: arr(b.activeFingerprints).map((d) => ({ fingerprint: String(d.fingerprint ?? ""), ip: String(d.ip ?? ""), firstSeen: iso(d.firstSeen), lastSeen: iso(d.lastSeen) })),
    })),
    terms: arr(r.termsAcceptances).map((x) => ({ userId: String(x.userId ?? ""), email: String(x.email ?? ""), ip: String(x.ip ?? ""), timestamp: iso(x.timestamp) })).reverse(),
  };
}

const toIntruder = (r: Raw): Intruder => ({
  id: idOf(r),
  ip: String(r.ip ?? ""),
  path: String(r.path ?? ""),
  deviceType: String(r.deviceType ?? ""),
  browser: String(r.browser ?? ""),
  os: String(r.os ?? ""),
  country: String(r.country ?? ""),
  countryCode: String(r.countryCode ?? ""),
  city: String(r.city ?? ""),
  isp: String(r.isp ?? ""),
  fileServed: r.fileServed === true,
  fileType: String(r.fileType ?? ""),
  reported: r.reportedToAuthorities === true,
  reportedAt: r.reportedAt ? iso(r.reportedAt) : undefined,
  timestamp: iso(r.timestamp),
});

export function toHoneypot(r: Raw): Honeypot {
  const s = obj(r.stats);
  return {
    stats: { total: num(s.total), uniqueIPs: num(s.uniqueIPs), uniqueCountries: num(s.uniqueCountries), canaryDownloads: num(s.canaryDownloads), reported: num(s.reported) },
    intruders: arr(r.intruders).map(toIntruder),
  };
}

