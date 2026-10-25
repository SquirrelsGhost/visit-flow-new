import { areas } from "../../../modules/teams/Area.model";
import { teamMentors, teams } from "../../../modules/teams/Team.model";
import { chunk, idOf, objectIdDate, toDate } from "../convert";
import type { StepContext } from "../context";
import type { V1Doc } from "../source";

const idList = (value: unknown): string[] => (Array.isArray(value) ? value.map(idOf).filter((id): id is string => id !== null) : []);
const createdAt = (doc: V1Doc, v1Id: string, now: Date) => toDate(doc.created_at ?? doc.createdAt) ?? objectIdDate(v1Id) ?? now;
const nameOf = (doc: V1Doc) => (typeof doc.name === "string" ? doc.name : "");

/** Schritt 2: Gebiete mit Gebietsmanager. Gibt zurück, welches Gebiet laut `team_ids` welche Teams hatte. */
export async function migrateAreas(ctx: StepContext): Promise<Map<string, string>> {
  const areaOfTeam = new Map<string, string>();
  for await (const doc of ctx.source.read("areas")) {
    const v1Id = idOf(doc._id);
    if (!v1Id) continue;
    const managerV1 = idOf(doc.manager_id);
    const managerId = ctx.ids.get("users", managerV1);
    if (managerV1 && !managerId) ctx.report.warn("Gebiet verweist auf fehlenden Gebietsmanager", v1Id);
    const id = ctx.ids.assign("areas", v1Id, createdAt(doc, v1Id, ctx.now));
    await ctx.tx.insert(areas).values({ id, name: nameOf(doc), managerId, isActive: doc.is_active !== false, createdAt: createdAt(doc, v1Id, ctx.now) });
    ctx.report.count("areas");
    for (const teamV1 of idList(doc.team_ids)) {
      if (areaOfTeam.has(teamV1)) ctx.report.warn("Team in mehreren Gebieten, erstes behalten", teamV1);
      else areaOfTeam.set(teamV1, id);
    }
  }
  return areaOfTeam;
}

/** Schritt 3: Teams mit Teamleiter, Gebiet und Mentoren. Mitglieder kommen über `users.team_id`. */
export async function migrateTeams(ctx: StepContext, areaOfTeam: Map<string, string>): Promise<void> {
  const mentors: (typeof teamMentors.$inferInsert)[] = [];
  for await (const doc of ctx.source.read("teams")) {
    const v1Id = idOf(doc._id);
    if (!v1Id) continue;
    const leaderV1 = idOf(doc.team_leader_id);
    const teamLeaderId = ctx.ids.get("users", leaderV1);
    if (leaderV1 && !teamLeaderId) ctx.report.warn("Team verweist auf fehlenden Teamleiter", v1Id);
    const id = ctx.ids.assign("teams", v1Id, createdAt(doc, v1Id, ctx.now));
    await ctx.tx.insert(teams).values({
      id,
      name: nameOf(doc),
      teamLeaderId,
      // v1 hielt die Zuordnung an zwei Stellen; `teams.area_id` gewinnt
      areaId: ctx.ids.get("areas", idOf(doc.area_id)) ?? areaOfTeam.get(v1Id) ?? null,
      isActive: doc.is_active !== false,
      createdAt: createdAt(doc, v1Id, ctx.now),
      updatedAt: toDate(doc.updated_at ?? doc.updatedAt) ?? createdAt(doc, v1Id, ctx.now),
    });
    ctx.report.count("teams");
    for (const memberV1 of new Set(idList(doc.member_ids))) {
      const userId = ctx.ids.get("users", memberV1);
      if (userId) ctx.memberOf.set(userId, [...(ctx.memberOf.get(userId) ?? []), id]);
    }
    for (const mentorV1 of new Set(idList(doc.mentor_ids))) {
      const userId = ctx.ids.get("users", mentorV1);
      if (userId) mentors.push({ teamId: id, userId });
      else ctx.report.warn("Team verweist auf fehlenden Mentor", v1Id);
    }
  }
  for (const part of chunk(mentors)) await ctx.tx.insert(teamMentors).values(part);
  ctx.report.count("team_mentors", mentors.length);
}
