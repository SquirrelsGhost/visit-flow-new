import { sql } from "drizzle-orm";
import { boolean, check, index, pgTable, primaryKey, text, timestamp, type AnyPgColumn } from "drizzle-orm/pg-core";
import { sqlList } from "../../lib/db/sqlList";
import { users } from "../users/User.model";

export const TEAM_MEMBER_ROLES = ["member", "mentor"] as const;

/**
 * Teams aus v1 (`teams`). Die Mitgliederlisten `member_ids` und `mentor_ids` aus v1 werden zur
 * Tabelle `team_members`, damit Abfragen wie "in welchem Team ist dieser Nutzer?" einen Index haben.
 */
export const teams = pgTable("teams", {
  id: text().primaryKey(),
  name: text().notNull().default(""),
  teamLeaderId: text().references((): AnyPgColumn => users.id, { onDelete: "set null" }),
  isActive: boolean().notNull().default(true),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("teams_team_leader_id_idx").on(table.teamLeaderId)]);

export const teamMembers = pgTable(
  "team_members",
  {
    teamId: text().notNull().references(() => teams.id, { onDelete: "cascade" }),
    userId: text().notNull().references(() => users.id, { onDelete: "cascade" }),
    role: text({ enum: TEAM_MEMBER_ROLES }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.teamId, table.userId, table.role] }),
    index("team_members_user_id_idx").on(table.userId),
    check("team_members_role_valid", sql`${table.role} in (${sqlList(TEAM_MEMBER_ROLES)})`),
  ],
);
