import { hasDemoSession } from "../auth/demoSession";
import { json, legacyRequest, messageOf } from "../battle/legacyRequest";
import { demoDelay } from "../battle/battleDemoStore";
import { updateMember, type MemberPatch as SharedPatch } from "../overview/memberApi";
import { demoMembers } from "./teamDemoData";
import type { MemberPatch, SaveResult, TeamMember } from "./teamTypes";

/**
 * Team und Tagesstatus über die v1-API: GET /auth/team-members (dieselbe Liste wie Battle-Arena und Verwaltung).
 * Geschrieben wird wie in der Verwaltung über memberApi.updateMember (PATCH /auth/team-members/:id, Demo im Tab,
 * Ereignis für alle offenen Listen); nur der eigene Status geht live über PATCH /auth/profile wie v1 updateProfile.
 */
const SAVE_FAILED = "Speichern fehlgeschlagen. Bitte versuche es noch einmal.";

type RawMember = TeamMember & { _id?: string; displayName?: string };

export async function loadTeamMembers(): Promise<TeamMember[] | null> {
  if (hasDemoSession()) {
    await demoDelay(220);
    return demoMembers();
  }
  const body = await legacyRequest("/auth/team-members");
  if (!body.success) return null;
  const raw = (Array.isArray(body.users) ? body.users : Array.isArray(body.data) ? body.data : []) as RawMember[];
  return raw.map((u) => ({ ...u, id: u.id || u._id || "", name: u.name || u.displayName || "?" }));
}

/** Speichert Status oder Anwesenheit; `self` = der angemeldete Nutzer selbst. */
export async function saveMemberPatch(id: string, patch: MemberPatch, self: boolean): Promise<SaveResult> {
  if (self && !hasDemoSession()) {
    const body = await legacyRequest("/auth/profile", json("PATCH", patch));
    return body.success ? { ok: true } : { ok: false, message: messageOf(body) || SAVE_FAILED };
  }
  if (hasDemoSession()) await demoDelay(260);
  return (await updateMember(id, patch as SharedPatch)) ? { ok: true } : { ok: false, message: SAVE_FAILED };
}
