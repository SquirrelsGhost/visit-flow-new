import { bigint, boolean, index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "../users/User.model";

/**
 * Refresh-Tokens im Format von v1 (server/src/models/RefreshToken.ts): SHA-256 des Roh-Tokens,
 * 7 Tage gültig, Rotationskette über `familyId`. Weil der Hash gleich gebildet wird, gilt ein
 * `vf_refresh`-Cookie aus v1 nach dem Umzug weiter. Abgelaufene Zeilen löscht der Aufräum-Job.
 */
export const refreshTokens = pgTable(
  "refresh_tokens",
  {
    id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    tokenHash: text().notNull().unique(),
    userId: text().notNull().references(() => users.id, { onDelete: "cascade" }),
    familyId: text().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    isRevoked: boolean().notNull().default(false),
  },
  (table) => [
    index("refresh_tokens_user_id_idx").on(table.userId),
    index("refresh_tokens_family_id_idx").on(table.familyId),
    index("refresh_tokens_expires_at_idx").on(table.expiresAt),
  ],
);
