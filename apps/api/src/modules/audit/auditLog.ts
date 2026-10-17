import { Types, type Connection } from "mongoose";

/**
 * Schreibt Sicherheitsereignisse in die v1-Collection `audit_logs`, im selben Format wie v1
 * (server/src/models/AuditLog.model.ts), damit das Admin-Sicherheitsdashboard sie weiter anzeigt.
 * v1 löscht die Einträge per TTL-Index nach 90 Tagen. Die volle IP wird hier bewusst behalten:
 * Sicherheitsprotokoll nach Art. 6 Abs. 1 lit. f DSGVO, mit kurzer Frist.
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

// Wie Mongoose in v1: fehlende Werte gar nicht speichern statt als null
const withoutUndefined = (value: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined));

export function mongoAuditLog(db: Connection): AuditLog {
  const logs = db.collection("audit_logs");
  return {
    async security(entry) {
      try {
        await logs.insertOne({
          action: entry.action,
          category: "SECURITY",
          actor: withoutUndefined({
            userId: entry.userId && Types.ObjectId.isValid(entry.userId) ? new Types.ObjectId(entry.userId) : undefined,
            email: entry.email,
            ip: entry.ip,
            userAgent: entry.userAgent,
          }),
          ...(entry.target ? { target: entry.target } : {}),
          ...(entry.metadata ? { metadata: entry.metadata } : {}),
          timestamp: new Date(),
        });
      } catch (error) {
        // Ein fehlendes Protokoll darf den Login nicht blockieren
        console.error("[Audit] Eintrag fehlgeschlagen:", error);
      }
    },
  };
}
