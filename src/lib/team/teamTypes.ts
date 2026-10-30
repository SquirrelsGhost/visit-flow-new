import type { DailyStatusFields } from "./dailyStatus";

/** Anwesenheit, die die Leitung morgens abhakt (v1 dailyAttendance). */
export type Attendance = "present" | "late" | "excused" | "absent";

/** Teammitglied, wie /auth/team-members es liefert (nur die Felder, die Tagesstatus und Teamleistung brauchen). */
export interface TeamMember extends DailyStatusFields {
  id: string;
  name: string;
  role: string;
  teamId?: string | null;
  strukturleiterId?: string | null;
  isActive?: boolean;
  battleInactive?: boolean;
  dailyAttendance?: Attendance | null;
  dailyAttendanceReason?: string | null;
  dailyAttendanceMinutesLate?: number | null;
  dailyAttendanceUpdatedAt?: string | null;
}

/** Änderung an Status oder Anwesenheit; null löscht ein Feld wie in v1. */
export type MemberPatch = Partial<Omit<TeamMember, "id" | "name" | "role">>;

export interface SaveResult {
  ok: boolean;
  message?: string;
}
