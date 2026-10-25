import { and, eq, inArray } from "drizzle-orm";
import type { Database } from "../../config/db";
import { isUuid } from "../../lib/db/ids";
import { areas } from "../teams/Area.model";
import { teams } from "../teams/Team.model";
import { users } from "../users/User.model";

export interface ScopeUser {
  id: string;
  role: string;
  roles?: string[];
  teamId?: string | null;
}

/** Datenzugriffe für die Team-Abgrenzung, nur lesend auf users, teams und areas. */
export interface ScopeSource {
  user(id: string): Promise<ScopeUser | null>;
  activeUsers(filter: { teamIds?: string[]; strukturleiterId?: string; mentorIds?: string[] }): Promise<ScopeUser[]>;
  /** Teams in den aktiven Gebieten eines Gebietsmanagers. */
  gebietsmanagerTeamIds(managerId: string): Promise<string[]>;
}

const columns = { id: users.id, role: users.role, roles: users.extraRoles, teamId: users.teamId };

export function pgScopeSource(db: Database): ScopeSource {
  return {
    async user(id) {
      if (!isUuid(id)) return null;
      const [row] = await db.select(columns).from(users).where(eq(users.id, id)).limit(1);
      return row ?? null;
    },
    async activeUsers({ teamIds, strukturleiterId, mentorIds }) {
      const validTeams = teamIds?.filter(isUuid);
      const validMentors = mentorIds?.filter(isUuid);
      if (validTeams?.length === 0 || validMentors?.length === 0) return [];
      if (strukturleiterId !== undefined && !isUuid(strukturleiterId)) return [];
      const conditions = [eq(users.isActive, true)];
      if (validTeams) conditions.push(inArray(users.teamId, validTeams));
      if (strukturleiterId) conditions.push(eq(users.strukturleiterId, strukturleiterId));
      if (validMentors) conditions.push(inArray(users.mentorId, validMentors));
      return db.select(columns).from(users).where(and(...conditions));
    },
    async gebietsmanagerTeamIds(managerId) {
      if (!isUuid(managerId)) return [];
      const rows = await db
        .select({ teamId: teams.id })
        .from(teams)
        .innerJoin(areas, eq(areas.id, teams.areaId))
        .where(and(eq(areas.managerId, managerId), eq(areas.isActive, true)));
      return rows.map((row) => row.teamId);
    },
  };
}
