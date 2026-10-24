import type { Database } from "../../config/db";
import { auditLogs } from "./AuditLog.model";

/**
 * Schreibt Sicherheitsereignisse in `audit_logs`, mit denselben Aktionen und Feldern wie v1
 * (server/src/models/AuditLog.model.ts), damit das Admin-Sicherheitsdashboard sie anzeigen kann.
 */
export type AuditAction = "LOGIN_SUCCESS" | "LOGIN_FAILED" | "LOGIN_BLOCKED" | "REFRESH_TOKEN_REUSED" | "CROSS_TEAM_ACCESS_DENIED";

export interface AuditEntry {
  action: AuditAction;
  userId?: string;
  email?: string;
  ip: string;
  userAgent?: string;
  target?: { type: "USER" | "TEAM"; id: string };
  metadata?: Record<string, unknown>;
}

export interface AuditLog {
  security(entry: AuditEntry): Promise<void>;
}

export function pgAuditLog(db: Database, now: () => Date = () => new Date()): AuditLog {
  return {
    async security(entry) {
      try {
        await db.insert(auditLogs).values({
          action: entry.action,
          category: "SECURITY",
          actorUserId: entry.userId ?? null,
          actorEmail: entry.email ?? null,
          actorIp: entry.ip,
          actorUserAgent: entry.userAgent ?? null,
          targetType: entry.target?.type ?? null,
          targetId: entry.target?.id ?? null,
          metadata: entry.metadata ?? null,
          timestamp: now(),
        });
      } catch (error) {
        // Ein fehlendes Protokoll darf den Login nicht blockieren
        console.error("[Audit] Eintrag fehlgeschlagen:", error);
      }
    },
  };
}
