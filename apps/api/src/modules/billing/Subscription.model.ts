import { boolean, index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { newId } from "../../lib/db/ids";
import { users } from "../users/User.model";

/**
 * Abos. Bisher liest v2 nur den Status fürs Profil. Die Felder für Stripe kommen dazu, wenn das
 * Abrechnungsmodul portiert wird.
 */
export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid().primaryKey().$defaultFn(() => newId()),
    userId: uuid().notNull().references(() => users.id, { onDelete: "cascade" }),
    planId: text().notNull(),
    /** Stripe-Status (active, trialing, past_due, canceled …). */
    status: text().notNull(),
    /** Zusatzpaket statt Hauptabo. */
    isAddon: boolean().notNull().default(false),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("subscriptions_user_id_created_at_idx").on(table.userId, table.createdAt.desc())],
);
