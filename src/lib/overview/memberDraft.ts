import { berlinDate, effectiveDailyStatus, type DailyStatusValue } from "./dailyStatus";
import type { MemberPatch } from "./memberApi";
import type { TeamUser } from "./teamTypes";

/** Was im Bearbeiten-Sheet änderbar ist; leere Zeichenkette heißt "keine Zuordnung". */
export interface MemberDraft {
  status: DailyStatusValue;
  reason: string;
  /** Letzter Tag der Abwesenheit, JJJJ-MM-TT. */
  until: string;
  role: string;
  strukturleiterId: string;
  mentorId: string;
  isActive: boolean;
  battleActive: boolean;
}

/** Rollen, die ein Teamleiter vergeben darf (v1: Berater, Mentor, Strukturleiter). */
export const EDITABLE_ROLES = ["berater", "mentor", "strukturleiter"] as const;

export function draftOf(member: TeamUser, now = new Date()): MemberDraft {
  const status = effectiveDailyStatus(member, now);
  const today = berlinDate(now) ?? "";
  return {
    status,
    reason: status === "active" ? "" : (member.dailyStatusReason ?? ""),
    until: status === "active" ? today : (berlinDate(member.dailyStatusEndDate) ?? today),
    role: member.role,
    strukturleiterId: member.strukturleiterId ?? "",
    mentorId: member.mentorId ?? "",
    isActive: member.isActive !== false,
    battleActive: member.battleInactive !== true,
  };
}

const endOf = (day: string) => new Date(`${day}T23:59:59`).toISOString();
const startOf = (day: string) => new Date(`${day}T00:00:00`).toISOString();

/** Nur die geänderten Felder; der Tagesstatus folgt den Regeln aus v1 (Krank und Frei gelten als entschuldigt). */
export function patchFrom(member: TeamUser, draft: MemberDraft, now = new Date()): MemberPatch {
  const before = draftOf(member, now);
  const patch: MemberPatch = {};
  const stamp = now.toISOString();
  const today = berlinDate(now) ?? "";
  const statusChanged = draft.status !== before.status || (draft.status !== "active" && (draft.reason.trim() !== before.reason || draft.until !== before.until));
  if (statusChanged) {
    patch.dailyStatus = draft.status;
    patch.dailyStatusUpdatedAt = stamp;
    if (draft.status === "active") {
      Object.assign(patch, { dailyStatusReason: null, dailyStatusStartDate: null, dailyStatusEndDate: null });
    } else {
      const until = draft.until && draft.until >= today ? draft.until : today;
      Object.assign(patch, { dailyStatusReason: draft.reason.trim() || null, dailyStatusStartDate: startOf(today), dailyStatusEndDate: endOf(until) });
      if (draft.status === "sick" || draft.status === "inactive") Object.assign(patch, { dailyAttendance: "excused", dailyAttendanceReason: draft.reason.trim() || null, dailyAttendanceUpdatedAt: stamp });
    }
  }
  if (draft.role !== before.role) patch.role = draft.role;
  // Strukturleiter führen ihre eigene Gruppe und gehören keiner anderen an
  const leader = draft.role === "strukturleiter" ? "" : draft.strukturleiterId;
  if (leader !== before.strukturleiterId) patch.strukturleiterId = leader || null;
  if (draft.mentorId !== before.mentorId) patch.mentorId = draft.mentorId || null;
  if (draft.isActive !== before.isActive) patch.isActive = draft.isActive;
  if (draft.battleActive !== before.battleActive) patch.battleInactive = !draft.battleActive;
  return patch;
}

/** Wer seine Gruppe verliert, wenn ein Strukturleiter die Rolle abgibt (v1 löscht dann deren strukturleiterId). */
export function orphanedBy(member: TeamUser, patch: MemberPatch, users: readonly TeamUser[]): string[] {
  if (member.role !== "strukturleiter" || !patch.role || patch.role === "strukturleiter") return [];
  return users.filter((u) => u.strukturleiterId === member.id).map((u) => u.id);
}
