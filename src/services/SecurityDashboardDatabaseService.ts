import { randomUUID } from "node:crypto";
import { demoAuditLogs, demoSnapshot } from "@/lib/security/securityDemoStore";
import { auditCsv, filterAudit } from "@/lib/security/securityLogic";
import type { AuditEntry, AuditFilter, BlockedIp, WhitelistEntry } from "@/lib/security/securityTypes";
import { LoginBackoffService } from "./sicherheit/LoginBackoffService";
import type { StoredRecord } from "./store/RecordStore";
import { createStore } from "./store/storeFactory";

interface StoredAuditRecord extends AuditEntry, StoredRecord {
  id: string;
  receivedAt: string;
}

interface StoredSecurityStateRecord extends StoredRecord {
  id: string;
  blacklist: BlockedIp[];
  whitelist: WhitelistEntry[];
  acknowledgedAlerts: string[];
  reportedIntruders: string[];
  receivedAt: string;
}

const auditStore = () => createStore<StoredAuditRecord>("audit-log");
const secStateStore = () => createStore<StoredSecurityStateRecord>("security-events");

async function loadSecState(): Promise<StoredSecurityStateRecord> {
  const existing = await secStateStore().get("state");
  if (existing) return existing;
  const snap = demoSnapshot();
  const seeded: StoredSecurityStateRecord = {
    id: "state",
    blacklist: snap.blacklist ?? [],
    whitelist: snap.whitelist ?? [],
    acknowledgedAlerts: [],
    reportedIntruders: [],
    receivedAt: new Date().toISOString(),
  };
  await secStateStore().upsert(seeded);
  return seeded;
}

async function ensureAuditSeeded(): Promise<StoredAuditRecord[]> {
  const existing = await auditStore().list();
  if (existing.length > 0) return existing;
  const demo = demoAuditLogs();
  for (const item of demo) {
    await auditStore().upsert({
      ...item,
      id: item.id,
      receivedAt: new Date(item.timestamp).toISOString(),
    });
  }
  return auditStore().list();
}

export class SecurityDashboardDatabaseService {
  static async getDdosStats() {
    const snap = demoSnapshot();
    return { stats: snap.firewall };
  }

  static async getBlacklist() {
    const state = await loadSecState();
    return { blacklist: state.blacklist };
  }

  static async blockIp(ip: string, reason: string, permanent: boolean) {
    const state = await loadSecState();
    const now = Date.now();
    const entry: BlockedIp = {
      ip,
      reason,
      category: "manual",
      blockedAt: now,
      blockedUntil: permanent ? undefined : now + 3_600_000,
      isPermanent: permanent,
      isActive: true,
      requestCount: 1,
      violations: 1,
      wasAuthenticated: false,
    };
    await secStateStore().upsert({
      ...state,
      blacklist: [entry, ...state.blacklist.filter((b) => b.ip !== ip)],
      receivedAt: new Date(now).toISOString(),
    });
    return { blocked: true };
  }

  static async unblockIp(ip: string) {
    const state = await loadSecState();
    await secStateStore().upsert({
      ...state,
      blacklist: state.blacklist.filter((b) => b.ip !== ip),
    });
    return { unblocked: true };
  }

  static async getWhitelist() {
    const state = await loadSecState();
    return { whitelist: state.whitelist };
  }

  static async addWhitelist(ip: string, comment: string, addedBy = "admin@pycie.com") {
    const state = await loadSecState();
    const entry: WhitelistEntry = { ip, comment, addedAt: Date.now(), addedBy };
    await secStateStore().upsert({
      ...state,
      whitelist: [entry, ...state.whitelist.filter((w) => w.ip !== ip)],
    });
    return { added: true };
  }

  static async removeWhitelist(ip: string) {
    const state = await loadSecState();
    await secStateStore().upsert({
      ...state,
      whitelist: state.whitelist.filter((w) => w.ip !== ip),
    });
    return { removed: true };
  }

  static async getLoginAttempts() {
    const snap = demoSnapshot();
    return { stats: snap.login };
  }

  static async unlockLoginIp(ip: string) {
    LoginBackoffService.setzeZurueck(ip, "");
    return { unlocked: true };
  }

  static async getAlerts() {
    const snap = demoSnapshot();
    const state = await loadSecState();
    const ackSet = new Set(state.acknowledgedAlerts);
    return {
      alerts: (snap.alerts ?? []).map((a) => ({
        ...a,
        acknowledged: a.acknowledged || ackSet.has(a.id),
      })),
    };
  }

  static async acknowledgeAlert(id: string) {
    const state = await loadSecState();
    if (!state.acknowledgedAlerts.includes(id)) {
      await secStateStore().upsert({
        ...state,
        acknowledgedAlerts: [...state.acknowledgedAlerts, id],
      });
    }
    return { acknowledged: true };
  }

  static async getSuspiciousActivity() {
    const snap = demoSnapshot();
    return snap.antiCopy ?? { totalEvents: 0, blockedCount: 0, entries: [] };
  }

  static async getHoneypotIntruders() {
    const snap = demoSnapshot();
    return snap.honeypot ?? { totalHits: 0, uniqueIps: 0, intruders: [] };
  }

  static async reportIntruder(id: string) {
    const state = await loadSecState();
    if (!state.reportedIntruders.includes(id)) {
      await secStateStore().upsert({
        ...state,
        reportedIntruders: [...state.reportedIntruders, id],
      });
    }
    return { reported: true };
  }

  static async listAuditLogs(filter: AuditFilter) {
    const all = await ensureAuditSeeded();
    const filtered = filterAudit(all, filter);
    return { logs: filtered.slice(0, 100), count: filtered.length };
  }

  static async appendAuditLog(entry: Omit<AuditEntry, "id" | "timestamp">) {
    const nowIso = new Date().toISOString();
    const record: StoredAuditRecord = {
      ...entry,
      id: `aud-${randomUUID().slice(0, 8)}`,
      timestamp: nowIso,
      receivedAt: nowIso,
    };
    await auditStore().upsert(record);
    return record;
  }

  static async deleteAuditLog(id: string) {
    await auditStore().removeWhere((a) => a.id === id);
    return { deleted: true };
  }

  static async cleanupAuditLogs(daysOld: number) {
    const cutoffMs = Date.now() - daysOld * 86_400_000;
    const removed = await auditStore().removeWhere((a) => new Date(a.timestamp).getTime() < cutoffMs);
    return { removed };
  }

  static async exportAuditCsv(category = "all") {
    const all = await ensureAuditSeeded();
    const filtered = category === "all" ? all : all.filter((a) => a.category === category);
    return auditCsv(filtered);
  }
}
