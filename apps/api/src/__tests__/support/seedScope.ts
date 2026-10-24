import type { Database } from "../../config/db";
import { newObjectId } from "../../lib/db/objectId";
import { areas, areaTeams } from "../../modules/teams/Area.model";
import { teamMembers, teams } from "../../modules/teams/Team.model";
import { users, type NewUserRow } from "../../modules/users/User.model";

/** Kleine Organisation: zwei Teams, ein Gebiet, Strukturleiter mit Mentor und Mentee. */
export async function seedScope(db: Database) {
  const id = () => newObjectId();
  const ids = { admin: id(), gm: id(), sl: id(), mentor: id(), mentee: id(), memberA: id(), memberB: id(), leaderB: id(), teamA: id(), teamB: id(), area: id() };
  const user = (userId: string, role: NewUserRow["role"], extra: Partial<NewUserRow> = {}): NewUserRow => ({
    id: userId, email: `${userId}@example.de`, name: userId, role, isWhitelisted: true, whitelistStatus: "approved", ...extra,
  });

  await db.insert(users).values([user(ids.admin, "admin"), user(ids.gm, "gebietsmanager"), user(ids.sl, "strukturleiter"), user(ids.leaderB, "teamleiter")]);
  await db.insert(teams).values([
    { id: ids.teamA, name: "Team Trio Nord", teamLeaderId: ids.sl },
    { id: ids.teamB, name: "Team Süd", teamLeaderId: ids.leaderB },
  ]);
  await db.insert(users).values([
    user(ids.mentor, "mentor", { strukturleiterId: ids.sl, teamId: ids.teamA }),
    user(ids.mentee, "berater", { mentorId: ids.mentor, teamId: ids.teamA, legacyId: "legacy-mentee" }),
    user(ids.memberA, "berater", { teamId: ids.teamA, strukturleiterId: ids.sl }),
    user(ids.memberB, "berater", { teamId: ids.teamB, paymentRequired: true }),
  ]);
  await db.insert(teamMembers).values([
    { teamId: ids.teamA, userId: ids.mentee, role: "member" },
    { teamId: ids.teamA, userId: ids.mentor, role: "mentor" },
    { teamId: ids.teamB, userId: ids.memberB, role: "member" },
  ]);
  await db.insert(areas).values({ id: ids.area, name: "Gebiet West", managerId: ids.gm });
  await db.insert(areaTeams).values({ areaId: ids.area, teamId: ids.teamB });
  return ids;
}
