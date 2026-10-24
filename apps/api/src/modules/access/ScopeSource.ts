import { and, eq, inArray, or, type SQL } from "drizzle-orm";
import type { Database } from "../../config/db";
import { areas, areaTeams } from "../teams/Area.model";
import { users } from "../users/User.model";

export interface ScopeUser {
  id: string;
  role: string;
  roles?: string[];
  teamId?: string | null;
}

/** Datenzugriffe für die Team-Abgrenzung, nur lesend auf users, areas und area_teams. */
export interface ScopeSource {
  user(id: string): Promise<ScopeUser | null>;
  /** Visit-Daten referenzieren Nutzer teils über die ID, teils über das alte v1-Feld `id`. */
  userByAnyId(anyId: string): Promise<ScopeUser | null>;
  activeUsers(filter: { teamIds?: string[]; strukturleiterId?: string; mentorIds?: string[] }): Promise<ScopeUser[]>;
  /** Teams in den aktiven Gebieten eines Gebietsmanagers. */
  gebietsmanagerTeamIds(managerId: string): Promise<string[]>;
}

const columns = { id: users.id, role: users.role, roles: users.roles, teamId: users.teamId };

export function pgScopeSource(db: Database): ScopeSource {
  const findOne = async (where: SQL | undefined) => {
    const [row] = await db.select(columns).from(users).where(where).limit(1);
    return row ?? null;
  };

  return {
    user: (id) => findOne(eq(users.id, id)),
    userByAnyId: (anyId) => findOne(or(eq(users.id, anyId), eq(users.legacyId, anyId))),
    async activeUsers({ teamIds, strukturleiterId, mentorIds }) {
      if (teamIds?.length === 0 || mentorIds?.length === 0) return [];
      const conditions = [eq(users.isActive, true)];
      if (teamIds) conditions.push(inArray(users.teamId, teamIds));
      if (strukturleiterId) conditions.push(eq(users.strukturleiterId, strukturleiterId));
      if (mentorIds) conditions.push(inArray(users.mentorId, mentorIds));
      return db.select(columns).from(users).where(and(...conditions));
    },
    async gebietsmanagerTeamIds(managerId) {
      const rows = await db
        .selectDistinct({ teamId: areaTeams.teamId })
        .from(areaTeams)
        .innerJoin(areas, eq(areas.id, areaTeams.areaId))
        .where(and(eq(areas.managerId, managerId), eq(areas.isActive, true)));
      return rows.map((row) => row.teamId);
    },
  };
}
