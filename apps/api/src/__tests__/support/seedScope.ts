import type { Database } from "../../config/db";
import { newId } from "../../lib/db/ids";
import { areas } from "../../modules/teams/Area.model";
import { teamMentors, teams } from "../../modules/teams/Team.model";
import { users, type NewUserRow } from "../../modules/users/User.model";

/** Kleine Organisation: zwei Teams, ein Gebiet, Strukturleiter mit Mentor und Mentee. */
export async function seedScope(db: Database) {
  const ids = {
    admin: newId(), gm: newId(), sl: newId(), mentor: newId(), mentee: newId(), memberA: newId(), memberB: newId(),
    leaderB: newId(), teamA: newId(), teamB: newId(), area: newId(),
  };
  const user = (userId: string, role: NewUserRow["role"], extra: Partial<NewUserRow> = {}): NewUserRow => ({
    id: userId, email: `${userId}@example.de`, name: userId, role, approvalStatus: "approved", ...extra,
  });

  await db.insert(users).values([user(ids.admin, "admin"), user(ids.gm, "gebietsmanager"), user(ids.sl, "strukturleiter"), user(ids.leaderB, "teamleiter")]);
  await db.insert(areas).values({ id: ids.area, name: "Gebiet West", managerId: ids.gm });
  await db.insert(teams).values([
    { id: ids.teamA, name: "Team Trio Nord", teamLeaderId: ids.sl },
    { id: ids.teamB, name: "Team Süd", teamLeaderId: ids.leaderB, areaId: ids.area },
  ]);
  await db.insert(users).values([
    user(ids.mentor, "mentor", { strukturleiterId: ids.sl, teamId: ids.teamA }),
    user(ids.mentee, "berater", { mentorId: ids.mentor, teamId: ids.teamA }),
    user(ids.memberA, "berater", { teamId: ids.teamA, strukturleiterId: ids.sl }),
    user(ids.memberB, "berater", { teamId: ids.teamB, paymentRequired: true }),
  ]);
  await db.insert(teamMentors).values({ teamId: ids.teamA, userId: ids.mentor });
  return ids;
}
