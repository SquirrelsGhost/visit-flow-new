/** Kopierschutz (Anti-Copy) und Honeypot-Fallen aus v1. */
export interface ThreatEvent {
  type: string;
  severity: string;
  details: string;
  time: string;
}

/** Vom Kopierschutz beobachtete IP (v1 GET /admin/suspicious-activity). */
export interface ThreatEntity {
  ip: string;
  userId?: string;
  userAgent?: string;
  score: number;
  blocked: boolean;
  blockReason?: string;
  firstSeen: string;
  lastSeen: string;
  totalEvents: number;
  requestsLast5Min: number;
  uniqueEndpoints: number;
  events: ThreatEvent[];
}

export interface UserSession {
  userId: string;
  email: string;
  ips: string[];
}

export interface MultiLoginAlert {
  userId: string;
  email: string;
  ips: string[];
  timestamp: string;
}

export interface DeviceBinding {
  userId: string;
  email: string;
  devices: { fingerprint: string; ip: string; firstSeen: string; lastSeen: string }[];
}

export interface TermsAcceptance {
  userId: string;
  email: string;
  ip: string;
  timestamp: string;
}

export interface AntiCopyReport {
  stats: { tracked: number; suspicious: number; blocked: number; warned: number; honeypotHits: number };
  threats: ThreatEntity[];
  sessions: UserSession[];
  multiLogins: MultiLoginAlert[];
  devices: DeviceBinding[];
  terms: TermsAcceptance[];
}

/** Treffer einer Honeypot-Falle mit Gerät und Ort (v1 HoneypotIntruderLog). */
export interface Intruder {
  id: string;
  ip: string;
  path: string;
  deviceType: string;
  browser: string;
  os: string;
  country: string;
  countryCode: string;
  city: string;
  isp: string;
  fileServed: boolean;
  fileType: string;
  reported: boolean;
  reportedAt?: string;
  timestamp: string;
}

export interface Honeypot {
  stats: { total: number; uniqueIPs: number; uniqueCountries: number; canaryDownloads: number; reported: number };
  intruders: Intruder[];
}

