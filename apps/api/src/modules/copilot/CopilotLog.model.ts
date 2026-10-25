import { sql } from "drizzle-orm";
import { check, index, jsonb, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import type { SealedValue } from "../../lib/crypto/dataCipher";
import { newId } from "../../lib/db/ids";
import { users } from "../users/User.model";

export const COPILOT_FEEDBACK = ["up", "down"] as const;
export const copilotFeedback = pgEnum("copilot_feedback", COPILOT_FEEDBACK);

/**
 * Ein Austausch mit Enes, damit 👍/👎 einer Antwort zugeordnet werden kann (v1 AiChatLog).
 * Frage und Antwort sind verschlüsselt; 👍-Antworten dienen Enes als Beispiele, was bei diesem
 * Berater wirkt. Nach COPILOT_LOG_DAYS löscht der Aufräum-Job.
 */
export const copilotLogs = pgTable(
  "copilot_logs",
  {
    id: uuid().primaryKey().$defaultFn(() => newId()),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    vertical: text().notNull(),
    question: jsonb().$type<SealedValue>().notNull(),
    reply: jsonb().$type<SealedValue>().notNull(),
    feedback: copilotFeedback(),
    reason: text(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("copilot_logs_user_id_created_at_idx").on(table.userId, table.createdAt.desc()),
    index("copilot_logs_created_at_idx").on(table.createdAt),
    check("copilot_logs_reason_length", sql`char_length(${table.reason}) <= 500`),
  ],
);
