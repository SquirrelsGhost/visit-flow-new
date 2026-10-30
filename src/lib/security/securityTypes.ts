import type { AntiCopyReport, Honeypot } from "./securityThreatTypes";

/** Einordnung einer gesperrten IP wie v1 ddosProtection.deriveCategory. */
export type BlockCategory = "real_user" | "rate_limit" | "manual" | "scraper" | "severe" | "honeypot";
/** Filtergruppen der Firewall-Liste (v1 DDoSProtectionTab FILTER_TABS, dazu Manuell). */
export type BlockGroup = "all" | "suspicious" | "scrapers" | "honeypot" | "manual";
export type AlertSeverity = "INFO" | "WARNING" | "CRITICAL";
export type AuditCategory = "SECURITY" | "ADMIN" | "USER" | "SYSTEM";
export type HealthLevel = "excellent" | "good" | "warning" | "critical";
export type ThreatLevel = "high" | "elevated" | "watch" | "low";
export type SecurityTab = "overview" | "firewall" | "sessions" | "audit";

/** v1 GET /security/ddos/stats */
export interface FirewallStats {
  activeIPs: number;
  blockedIPs: number;
  permanentBlocks: number;
  temporaryBlocks: number;
}

/** Eintrag der v1-Blacklist mit Herkunft (GET /security/ddos/blacklist). Zeiten in ms. */
export interface BlockedIp {
  ip: string;
  reason: string;
  category: BlockCategory;
  blockedAt: number;
  blockedUntil?: number;
  isPermanent: boolean;
  isActive: boolean;
  requestCount: number;
  violations: number;
  email?: string;
  wasAuthenticated: boolean;
  userAgent?: string;
  country?: string;
  countryCode?: string;
  city?: string;
  isp?: string;
}

export interface WhitelistEntry {
  ip: string;
  comment: string;
  addedAt: number;
  addedBy?: string;
}

/** Login-Sperre nach 5 Fehlversuchen für 15 Minuten (v1 LoginProtectionService). */
export interface LoginLock {
  ip: string;
  email: string;
  lockedAt: number;
  lockedUntil: number;
  attemptCount: number;
}

export interface LoginProtection {
  activeLocks: number;
  /** IPs mit Fehlversuchen, die noch nicht gesperrt sind. */
  activeAttempts: number;
  locks: LoginLock[];
}

export interface SecurityAlert {
  id: string;
  type: string;
  severity: AlertSeverity;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  acknowledgedAt?: string;
}

export interface AuditEntry {
  id: string;
  action: string;
  category: AuditCategory;
  actorEmail?: string;
  actorName?: string;
  actorIp: string;
  userAgent?: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

/** Gesperrtes Benutzerkonto (v1 /admin/users isBlocked). */
export interface BlockedAccount {
  id: string;
  name: string;
  email: string;
  role: string;
  reason?: string;
  until?: string;
}

/** Alles, was die Seite beim Laden holt; null heißt: dieser Teil konnte nicht geladen werden. */
export interface SecuritySnapshot {
  firewall: FirewallStats | null;
  blacklist: BlockedIp[] | null;
  whitelist: WhitelistEntry[] | null;
  login: LoginProtection | null;
  alerts: SecurityAlert[] | null;
  antiCopy: AntiCopyReport | null;
  honeypot: Honeypot | null;
  accounts: BlockedAccount[] | null;
  loadedAt: string;
}

export interface AuditFilter {
  category: AuditCategory | "all";
  query: string;
}

/** v1 lädt alle 30 Sekunden neu (LoginAttemptsTable, Anti-Copy). */
export const REFRESH_MS = 30_000;
/** Server liefert höchstens 100 Protokolleinträge je Abfrage. */
export const AUDIT_LIMIT = 100;
export const AUDIT_CATEGORIES: readonly AuditCategory[] = ["SECURITY", "ADMIN", "USER", "SYSTEM"];
export const BLOCK_GROUPS: readonly BlockGroup[] = ["all", "suspicious", "scrapers", "honeypot", "manual"];
