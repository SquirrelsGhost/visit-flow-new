import { hasDemoSession } from "../auth/demoSession";
import type { Vertical } from "../battle/battleCategories";
import { json, legacyRequest } from "../battle/legacyRequest";
import { applyDemoPatches, saveDemoPatch, TEAM_UPDATED_EVENT, type MemberPatch } from "../overview/memberApi";
import { idOf, listIn, loadTeamActivity, str, toUser } from "../overview/teamApi";
import { DEMO_TEAM_ID, demoActivity, demoTeam } from "../overview/teamDemoData";
import type { TeamData } from "../overview/teamTypes";
import { DEMO_STRENGTH, demoDirectory } from "./orgDemoData";
import type { OrgDirectory } from "./orgTypes";

/** Was nur ein Admin an einer Person ändern darf (v1 PATCH /admin/users/:id). */
export type AdminPatch = Pick<MemberPatch, "teamId" | "strukturleiterId" | "mentorId" | "isBlocked" | "blockReason">;

/** Alle Teams und Personen für den Admin (v1 GET /teams und GET /admin/users); Demo mit drei Teams. */
export async function loadDirectory(): Promise<OrgDirectory> {
  if (hasDemoSession()) {
    const demo = demoDirectory();
    return { ...demo, users: applyDemoPatches(demo.users) };
  }
  const [teamsBody, usersBody] = await Promise.all([legacyRequest("/teams"), legacyRequest("/admin/users")]);
  if (!teamsBody.success || !usersBody.success) throw new Error("directory");
  return {
    teams: listIn(teamsBody, "data", "teams").map((t) => ({ id: idOf(t), name: String(t.name ?? "Team"), leaderId: str(t.team_leader_id) })),
    users: listIn(usersBody, "users", "data").map(toUser),
  };
}

/** Verkäufe und Türen eines beliebigen Teams im Zeitraum (Admin klappt ein Team auf). */
export async function loadActivity(teamId: string, vertical: Vertical, start: Date, end: Date): Promise<Pick<TeamData, "products" | "doors">> {
  if (hasDemoSession()) {
    if (teamId === DEMO_TEAM_ID) return demoTeam(vertical);
    const users = demoDirectory().users.filter((u) => u.teamId === teamId);
    return demoActivity(users, vertical, (id) => DEMO_STRENGTH[id] ?? 1);
  }
  return loadTeamActivity(teamId, vertical, start, end);
}

/** Team wechseln oder Konto sperren (v1 PATCH /admin/users/:id); im Demo-Modus nur in diesem Tab. */
export async function updateAsAdmin(id: string, patch: AdminPatch): Promise<boolean> {
  if (hasDemoSession()) {
    if (!saveDemoPatch(id, patch)) return false;
  } else {
    const body = await legacyRequest(`/admin/users/${id}`, json("PATCH", patch));
    if (body.success === false) return false;
  }
  window.dispatchEvent(new Event(TEAM_UPDATED_EVENT));
  return true;
}
