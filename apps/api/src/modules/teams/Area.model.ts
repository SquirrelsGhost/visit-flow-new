import { boolean, index, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "../users/User.model";
import { teams } from "./Team.model";

/**
 * Gebiete aus v1 (`areas`) mit ihrem Gebietsmanager. v1 hielt die Zuordnung doppelt
 * (`areas.team_ids` und `teams.area_id`); hier gibt es nur noch `area_teams`.
 */
export const areas = pgTable("areas", {
  id: text().primaryKey(),
  name: text().notNull().default(""),
  managerId: text().references(() => users.id, { onDelete: "set null" }),
  isActive: boolean().notNull().default(true),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("areas_manager_id_idx").on(table.managerId)]);

export const areaTeams = pgTable(
  "area_teams",
  {
    areaId: text().notNull().references(() => areas.id, { onDelete: "cascade" }),
    teamId: text().notNull().references(() => teams.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.areaId, table.teamId] }), index("area_teams_team_id_idx").on(table.teamId)],
);
