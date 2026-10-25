import { bigint, index, integer, jsonb, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { CONSENT_SOURCES, type ConsentChoice } from "@visit-flow/shared/consent";

export const consentSource = pgEnum("consent_source", CONSENT_SOURCES);

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
    source: consentSource().notNull(),
    receivedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("consent_logs_consent_id_received_at_idx").on(table.consentId, table.receivedAt.desc()),
    index("consent_logs_received_at_idx").on(table.receivedAt),
  ],
);

export type ConsentLogDoc = Omit<typeof consentLogs.$inferSelect, "id">;
