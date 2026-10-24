import { areas, areaTeams } from "../../../modules/teams/Area.model";
import { teamMembers, teams } from "../../../modules/teams/Team.model";
import { chunk, idOf, objectIdDate, toDate } from "../convert";
import type { StepContext } from "../context";
import type { V1Doc } from "../source";

const ids = (value: unknown): string[] => (Array.isArray(value) ? value.map(idOf).filter((id): id is string => id !== null) : []);
const createdAt = (doc: V1Doc, id: string, now: Date) => toDate(doc.created_at ?? doc.createdAt) ?? objectIdDate(id) ?? now;

/** Schritt 2: Teams mit Mitgliedern und Mentoren, danach Gebiete mit ihren Teams. */
export async function migrateTeams(ctx: StepContext): Promise<void> {
  const knownUser = (id: string | null, teamId: string, kind: string) => {
    if (!id) return null;
    if (ctx.userIds.has(id)) return id;
    ctx.report.warn(`Team verweist auf fehlende(n) ${kind}`, teamId);
    return null;
  };
  const teamAreas: { areaId: string; teamId: string }[] = [];
  const members: (typeof teamMembers.$inferInsert)[] = [];

  for await (const doc of ctx.source.read("teams")) {
    const id = idOf(doc._id);
    if (!id) continue;
    await ctx.tx.insert(teams).values({
      id,
      name: typeof doc.name === "string" ? doc.name : "",
      teamLeaderId: knownUser(idOf(doc.team_leader_id), id, "Teamleiter"),
      isActive: doc.is_active !== false,
      createdAt: createdAt(doc, id, ctx.now),
      updatedAt: toDate(doc.updated_at ?? doc.updatedAt) ?? createdAt(doc, id, ctx.now),
    });
    ctx.teamIds.add(id);
    ctx.report.count("teams");
    const areaId = idOf(doc.area_id);
    if (areaId) teamAreas.push({ areaId, teamId: id });
    for (const [role, list] of [["member", doc.member_ids], ["mentor", doc.mentor_ids]] as const) {
      for (const userId of new Set(ids(list))) {
        if (knownUser(userId, id, role === "member" ? "Mitglied" : "Mentor")) members.push({ teamId: id, userId, role });
      }
    }
  }
  for (const part of chunk(members)) await ctx.tx.insert(teamMembers).values(part);
  ctx.report.count("team_members", members.length);
  await migrateAreas(ctx, teamAreas);
}

async function migrateAreas(ctx: StepContext, fromTeams: { areaId: string; teamId: string }[]): Promise<void> {
  const links = new Map<string, { areaId: string; teamId: string }>();
  const areaIds = new Set<string>();
  for await (const doc of ctx.source.read("areas")) {
    const id = idOf(doc._id);
    if (!id) continue;
    const managerId = idOf(doc.manager_id);
    if (managerId && !ctx.userIds.has(managerId)) ctx.report.warn("Gebiet verweist auf fehlenden Gebietsmanager", id);
    await ctx.tx.insert(areas).values({
      id,
      name: typeof doc.name === "string" ? doc.name : "",
      managerId: managerId && ctx.userIds.has(managerId) ? managerId : null,
      isActive: doc.is_active !== false,
      createdAt: createdAt(doc, id, ctx.now),
    });
    areaIds.add(id);
    ctx.report.count("areas");
    for (const teamId of ids(doc.team_ids)) links.set(`${id}:${teamId}`, { areaId: id, teamId });
  }
  // v1 hielt die Zuordnung an zwei Stellen, hier werden beide zusammengeführt
  for (const link of fromTeams) links.set(`${link.areaId}:${link.teamId}`, link);
  const valid = [...links.values()].filter((link) => {
    const ok = areaIds.has(link.areaId) && ctx.teamIds.has(link.teamId);
    if (!ok) ctx.report.warn("Gebiet-Team-Zuordnung mit fehlendem Ziel übersprungen", `${link.areaId}/${link.teamId}`);
    return ok;
  });
  for (const part of chunk(valid)) await ctx.tx.insert(areaTeams).values(part);
  ctx.report.count("area_teams", valid.length);
}
