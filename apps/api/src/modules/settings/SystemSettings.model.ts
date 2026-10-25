import { sql } from "drizzle-orm";
import { boolean, check, pgTable, smallint, timestamp } from "drizzle-orm/pg-core";

/** Systemschalter aus v1 (`systemsettings`). Genau eine Zeile mit `id = 1`. */
export const systemSettings = pgTable("system_settings", {
  id: smallint().primaryKey().default(1),
  showTeamLeiterLiveTracking: boolean().notNull().default(true),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
}, (table) => [check("system_settings_single_row", sql`${table.id} = 1`)]);
