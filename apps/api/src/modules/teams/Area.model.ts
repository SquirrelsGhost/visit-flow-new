import { boolean, index, pgTable, text, timestamp, uuid, type AnyPgColumn } from "drizzle-orm/pg-core";
import { newId } from "../../lib/db/ids";
import { users } from "../users/User.model";

/** Gebiete mit ihrem Gebietsmanager. Welche Teams dazugehören, steht an `teams.area_id`. */
export const areas = pgTable(
  "areas",
  {
    id: uuid().primaryKey().$defaultFn(() => newId()),
    name: text().notNull(),
    managerId: uuid().references((): AnyPgColumn => users.id, { onDelete: "set null" }),
    isActive: boolean().notNull().default(true),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("areas_manager_id_idx").on(table.managerId)],
);
