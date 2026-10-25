import { bigint, index, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * Sicherheitsprotokoll (Login, Token-Missbrauch, verweigerter Teamzugriff). Die volle IP wird
 * bewusst behalten: Art. 6 Abs. 1 lit. f DSGVO, 90 Tage wie in v1, danach löscht der Aufräum-Job.
 * `actorUserId` ist absichtlich kein Fremdschlüssel: Der Eintrag bleibt, auch wenn das Konto geht.
 */
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    action: text().notNull(),
    category: text().notNull(),
    actorUserId: uuid(),
    actorEmail: text(),
    actorIp: text(),
    actorUserAgent: text(),
    targetType: text(),
    targetId: text(),
    metadata: jsonb().$type<Record<string, unknown>>(),
    timestamp: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("audit_logs_timestamp_idx").on(table.timestamp),
    index("audit_logs_action_timestamp_idx").on(table.action, table.timestamp.desc()),
    index("audit_logs_actor_user_id_idx").on(table.actorUserId),
  ],
);

export const AUDIT_RETENTION_DAYS = 90;
