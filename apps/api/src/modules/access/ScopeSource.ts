import { Types, type Connection } from "mongoose";

export interface ScopeUser {
  id: string;
  role: string;
  roles?: string[];
  teamId?: string | null;
}

/** Datenzugriffe für die Team-Abgrenzung, nur lesend auf den v1-Collections users, teams, areas. */
export interface ScopeSource {
  user(id: string): Promise<ScopeUser | null>;
  /** Visit-Daten referenzieren Nutzer teils über `_id`, teils über das alte Feld `id`. */
  userByAnyId(anyId: string): Promise<ScopeUser | null>;
  activeUsers(filter: { teamIds?: string[]; strukturleiterId?: string; mentorIds?: string[] }): Promise<ScopeUser[]>;
  /** Teams in den aktiven Gebieten eines Gebietsmanagers. */
  gebietsmanagerTeamIds(managerId: string): Promise<string[]>;
}

interface RawUser {
  _id: Types.ObjectId;
  role: string;
  roles?: string[];
  teamId?: string | null;
}

const toScopeUser = (u: RawUser): ScopeUser => ({ id: String(u._id), role: u.role, roles: u.roles, teamId: u.teamId ?? null });
const projection = { role: 1, roles: 1, teamId: 1 };

export function mongoScopeSource(db: Connection): ScopeSource {
  const users = db.collection<RawUser>("users");
  const teams = db.collection<{ _id: Types.ObjectId; area_id?: Types.ObjectId }>("teams");
  const areas = db.collection<{ _id: Types.ObjectId; team_ids?: Types.ObjectId[] }>("areas");

  const byObjectId = async (id: string) =>
    Types.ObjectId.isValid(id) ? users.findOne({ _id: new Types.ObjectId(id) }, { projection }) : null;

  return {
    async user(id) {
      const found = await byObjectId(id);
      return found ? toScopeUser(found) : null;
    },
    async userByAnyId(anyId) {
      const found = (await byObjectId(anyId)) ?? (await users.findOne({ id: anyId }, { projection }));
      return found ? toScopeUser(found) : null;
    },
    async activeUsers({ teamIds, strukturleiterId, mentorIds }) {
      const filter: Record<string, unknown> = { isActive: true };
      if (teamIds) filter.teamId = { $in: teamIds };
      if (strukturleiterId) filter.strukturleiterId = strukturleiterId;
      if (mentorIds) filter.mentorId = { $in: mentorIds };
      const rows = await users.find(filter, { projection }).toArray();
      return rows.map(toScopeUser);
    },
    async gebietsmanagerTeamIds(managerId) {
      if (!Types.ObjectId.isValid(managerId)) return [];
      const managed = await areas.find({ manager_id: new Types.ObjectId(managerId), is_active: true }, { projection: { team_ids: 1 } }).toArray();
      const ids = new Set<string>();
      managed.forEach((area) => (area.team_ids ?? []).forEach((teamId) => ids.add(String(teamId))));
      if (managed.length > 0) {
        const inAreas = await teams.find({ area_id: { $in: managed.map((area) => area._id) } }, { projection: { _id: 1 } }).toArray();
        inAreas.forEach((team) => ids.add(String(team._id)));
      }
      return [...ids];
    },
  };
}
