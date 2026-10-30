import { hasDemoSession } from "../auth/demoSession";
import { json, legacyRequest } from "../battle/legacyRequest";
import type { TeamData, TeamUser } from "./teamTypes";

/** Felder, die Teamleiter an einem Mitglied ändern dürfen (v1 updateTeamMember). null löscht eine Zuordnung. */
export type MemberPatch = Partial<Record<"role" | "strukturleiterId" | "mentorId" | "teamId" | "dailyStatus" | "dailyStatusReason" | "dailyStatusStartDate" | "dailyStatusEndDate" | "dailyStatusUpdatedAt" | "dailyAttendance" | "dailyAttendanceReason" | "dailyAttendanceUpdatedAt" | "blockReason", string | null>> &
  Partial<Record<"isActive" | "battleInactive" | "isBlocked", boolean>> &
  Partial<Record<"dailyAttendanceMinutesLate", number | null>>;

/** Meldet geänderte Mitglieder an alle Ansichten im Tab, damit Listen sofort nachziehen. */
export const TEAM_UPDATED_EVENT = "vf:team-updated";
const DEMO_KEY = "vf_team_demo_patches";

function readPatches(): Record<string, MemberPatch> {
  try {
    const raw = window.sessionStorage.getItem(DEMO_KEY);
    return raw ? (JSON.parse(raw) as Record<string, MemberPatch>) : {};
  } catch {
    return {};
  }
}

const clean = (patch: MemberPatch): Partial<TeamUser> =>
  Object.fromEntries(Object.entries(patch).map(([k, v]) => [k, v === null ? undefined : v])) as Partial<TeamUser>;

/** Legt die im Demo-Modus gemachten Änderungen über Personen. */
export function applyDemoPatches(users: readonly TeamUser[]): TeamUser[] {
  const patches = readPatches();
  return users.map((u) => (patches[u.id] ? { ...u, ...clean(patches[u.id]!) } : u));
}

/** Legt die im Demo-Modus gemachten Änderungen über das Beispielteam. */
export function withDemoPatches(data: TeamData): TeamData {
  return { ...data, users: applyDemoPatches(data.users) };
}

/** Merkt sich eine Änderung im Demo-Modus für diesen Tab; false, wenn der Speicher fehlt. */
export function saveDemoPatch(id: string, patch: MemberPatch): boolean {
  const patches = readPatches();
  patches[id] = { ...patches[id], ...patch };
  try {
    window.sessionStorage.setItem(DEMO_KEY, JSON.stringify(patches));
    return true;
  } catch {
    return false;
  }
}

/** Ändert ein Teammitglied (v1 PATCH /api/auth/team-members/:id); im Demo-Modus nur in diesem Tab. */
export async function updateMember(id: string, patch: MemberPatch): Promise<boolean> {
  if (hasDemoSession()) {
    if (!saveDemoPatch(id, patch)) return false;
  } else {
    const body = await legacyRequest(`/auth/team-members/${id}`, json("PATCH", patch));
    if (body.success === false) return false;
  }
  window.dispatchEvent(new Event(TEAM_UPDATED_EVENT));
  return true;
}

/** Mehrere Mitglieder nacheinander ändern (Sammelaktionen); liefert, wie viele geklappt haben. */
export async function updateMembers(ids: readonly string[], patch: MemberPatch): Promise<number> {
  let done = 0;
  for (const id of ids) if (await updateMember(id, patch)) done += 1;
  return done;
}
