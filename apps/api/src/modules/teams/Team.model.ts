import { boolean, index, pgTable, primaryKey, text, timestamp, uuid, type AnyPgColumn } from "drizzle-orm/pg-core";
import { newId } from "../../lib/db/ids";
import { users } from "../users/User.model";
import { areas } from "./Area.model";

/**
 * Teams. Wer Mitglied ist, steht nur an `users.team_id` (eine Quelle, kein doppeltes
 * `member_ids` wie in v1). Mentoren eines Teams stehen in `team_mentors`.
 */
export const teams = pgTable(
  "teams",
  {
    id: uuid().primaryKey().$defaultFn(() => newId()),
    name: text().notNull(),
    teamLeaderId: uuid().references((): AnyPgColumn => users.id, { onDelete: "set null" }),
    areaId: uuid().references((): AnyPgColumn => areas.id, { onDelete: "set null" }),
    isActive: boolean().notNull().default(true),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("teams_team_leader_id_idx").on(table.teamLeaderId), index("teams_area_id_idx").on(table.areaId)],
);

export const teamMentors = pgTable(
  "team_mentors",
  {
    teamId: uuid().notNull().references(() => teams.id, { onDelete: "cascade" }),
    userId: uuid().notNull().references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.teamId, table.userId] }), index("team_mentors_user_id_idx").on(table.userId)],
);
