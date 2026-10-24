import { sql } from "drizzle-orm";
import { check, index, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { COACH_MEMORY_KINDS } from "@visit-flow/shared/copilotSchema";
import type { SealedValue } from "../../lib/crypto/dataCipher";
import { sqlList } from "../../lib/db/sqlList";
import { users } from "../users/User.model";

export const COACH_MEMORY_SOURCES = ["user", "enes"] as const;

/**
 * Langzeit-Gedächtnis von Enes je Berater (v1 EnesMemory, hier ohne Embeddings). Der Inhalt ist mit
 * seal() verschlüsselt. Abgelaufene Einträge (expiresAt) löscht der Aufräum-Job, Abfragen filtern selbst.
 */
export const coachMemories = pgTable(
  "coach_memories",
  {
    id: text().primaryKey(),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kind: text({ enum: COACH_MEMORY_KINDS }).notNull(),
    content: jsonb().$type<SealedValue>().notNull(),
    /** "user" = ausdrücklich gesagt ("merk dir …"), "enes" = von Enes aus dem Gespräch gelernt. */
    source: text({ enum: COACH_MEMORY_SOURCES }).notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
  },
  (table) => [
    index("coach_memories_user_id_created_at_idx").on(table.userId, table.createdAt.desc()),
    index("coach_memories_expires_at_idx").on(table.expiresAt),
    check("coach_memories_kind_valid", sql`${table.kind} in (${sqlList(COACH_MEMORY_KINDS)})`),
    check("coach_memories_source_valid", sql`${table.source} in (${sqlList(COACH_MEMORY_SOURCES)})`),
  ],
);
