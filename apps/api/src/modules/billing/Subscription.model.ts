import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "../users/User.model";

/**
 * Abos aus v1 (`subscriptions`). Bisher liest v2 nur den Status fürs Profil. Die Felder für
 * Stripe kommen dazu, wenn das Abrechnungsmodul portiert wird.
 */
export const subscriptions = pgTable("subscriptions", {
  id: text().primaryKey(),
  userId: text().notNull().references(() => users.id, { onDelete: "cascade" }),
  planId: text().notNull(),
  status: text().notNull(),
  /** `addon` für Zusatzpakete, sonst leer. */
  type: text(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("subscriptions_user_id_created_at_idx").on(table.userId, table.createdAt.desc())]);
