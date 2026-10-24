import { sql } from "drizzle-orm";
import { bigint, check, index, integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { sqlList } from "../../lib/db/sqlList";
import { CONSENT_SOURCES, type ConsentChoice } from "@visit-flow/shared/consent";

/**
 * Einwilligungs-Protokoll (Nachweis nach Art. 7 Abs. 1 DSGVO). Bewusst ohne IP, User-Agent und userId.
 * Einträge älter als CONSENT_LOG_DAYS löscht der Aufräum-Job.
 */
export const consentLogs = pgTable(
  "consent_logs",
  {
    id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    consentId: text().notNull(),
    version: integer().notNull(),
    choice: jsonb().$type<ConsentChoice>().notNull(),
    source: text({ enum: CONSENT_SOURCES }).notNull(),
    receivedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("consent_logs_consent_id_received_at_idx").on(table.consentId, table.receivedAt.desc()),
    index("consent_logs_received_at_idx").on(table.receivedAt),
    check("consent_logs_source_valid", sql`${table.source} in (${sqlList(CONSENT_SOURCES)})`),
  ],
);

export type ConsentLogDoc = Omit<typeof consentLogs.$inferSelect, "id">;
