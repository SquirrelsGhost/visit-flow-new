import { index, jsonb, pgEnum, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { COACH_MEMORY_KINDS } from "@visit-flow/shared/copilotSchema";
import type { SealedValue } from "../../lib/crypto/dataCipher";
import { newId } from "../../lib/db/ids";
import { users } from "../users/User.model";

export const COACH_MEMORY_SOURCES = ["user", "enes"] as const;
export const coachMemoryKind = pgEnum("coach_memory_kind", COACH_MEMORY_KINDS);
export const coachMemorySource = pgEnum("coach_memory_source", COACH_MEMORY_SOURCES);

/**
 * Langzeit-Gedächtnis von Enes je Berater (v1 EnesMemory, hier ohne Embeddings). Der Inhalt ist mit
 * seal() verschlüsselt. Abgelaufene Einträge (expiresAt) löscht der Aufräum-Job, Abfragen filtern selbst.
 */
export const coachMemories = pgTable(
  "coach_memories",
  {
    id: uuid().primaryKey().$defaultFn(() => newId()),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kind: coachMemoryKind().notNull(),
    content: jsonb().$type<SealedValue>().notNull(),
    /** "user" = ausdrücklich gesagt ("merk dir …"), "enes" = von Enes aus dem Gespräch gelernt. */
    source: coachMemorySource().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
  },
  (table) => [
    index("coach_memories_user_id_created_at_idx").on(table.userId, table.createdAt.desc()),
    index("coach_memories_expires_at_idx").on(table.expiresAt),
  ],
);
