import { bigint, index, pgTable, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Fehlgeschlagene Logins für die Drosselung. `key` ist ein SHA-256 von IP bzw. E-Mail, nie der
 * Klartext. Zeilen außerhalb des Zeitfensters löscht der Aufräum-Job.
 */
export const loginFailures = pgTable(
  "login_failures",
  {
    id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    key: text().notNull(),
    at: timestamp({ withTimezone: true }).notNull(),
  },
  (table) => [index("login_failures_key_at_idx").on(table.key, table.at.desc()), index("login_failures_at_idx").on(table.at)],
);
