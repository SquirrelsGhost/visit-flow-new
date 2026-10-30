import type { AuthUser } from "@/shared/auth/authSchemas";
import { berlinDate, effectiveStatus, isStatusActiveOn } from "./dailyStatus";
import type { Attendance, TeamMember } from "./teamTypes";

/** Gruppen der Anwesenheitsliste in der Reihenfolge von v1 (TeamActivityList). */
export const ATTENDANCE_GROUPS = ["pending", "open", "present", "late", "excused", "absent"] as const;

export type AttendanceGroup = (typeof ATTENDANCE_GROUPS)[number];

/** Anwesenheit nur, wenn sie heute gesetzt wurde; sonst ist der Tag noch offen. */
export function attendanceToday(member: TeamMember, ref: Date = new Date()): Attendance | null {
  if (!member.dailyAttendance || berlinDate(member.dailyAttendanceUpdatedAt) !== berlinDate(ref)) return null;
  return member.dailyAttendance;
}

/**
 * Wohin jemand heute gehört: Wer sich selbst abgemeldet hat und noch nicht bestätigt ist, steht unter
 * "Offene Anfragen"; ohne Eintrag unter "Noch zu bearbeiten".
 */
export function attendanceGroup(member: TeamMember, ref: Date = new Date()): AttendanceGroup {
  const today = attendanceToday(member, ref);
  if (!today && isStatusActiveOn(member, ref)) return "pending";
  return today ?? "open";
}

/** Wer in der Liste erscheint, wie v1: keine Admins, keine Inaktiven; Teamleiter sehen ihr Team ohne andere Teamleiter. */
export function visibleMembers(viewer: AuthUser, members: readonly TeamMember[]): TeamMember[] {
  const teamId = typeof viewer.teamId === "string" ? viewer.teamId : undefined;
  return members.filter((m) => {
    if (m.role === "admin" || m.isActive === false || m.battleInactive === true) return false;
    if (viewer.role === "admin") return true;
    if (viewer.role === "strukturleiter") return m.strukturleiterId === viewer.id || (teamId !== undefined && m.teamId === teamId);
    return teamId !== undefined && m.teamId === teamId && m.role !== "teamleiter";
  });
}

const ORDER = { active: 1, sick: 2, wakeup_inactive: 3, inactive: 4 } as const;

/** Aktive zuerst, dann nach Status und Name. */
export function sortMembers(members: readonly TeamMember[], ref: Date = new Date()): TeamMember[] {
  return [...members].sort((a, b) => ORDER[effectiveStatus(a, ref)] - ORDER[effectiveStatus(b, ref)] || a.name.localeCompare(b.name, "de"));
}

export type GroupedMembers = Record<AttendanceGroup, TeamMember[]>;

export function groupMembers(members: readonly TeamMember[], ref: Date = new Date()): GroupedMembers {
  const groups = Object.fromEntries(ATTENDANCE_GROUPS.map((g) => [g, [] as TeamMember[]])) as GroupedMembers;
  for (const member of sortMembers(members, ref)) groups[attendanceGroup(member, ref)].push(member);
  return groups;
}

/** Kurzname für Listen und WhatsApp: "Sarah K." */
export function shortName(name: string): string {
  const [first = "", second] = name.trim().split(/\s+/);
  return second ? `${first} ${second.charAt(0)}.` : first || "?";
}

const WHATSAPP: Record<AttendanceGroup, string> = {
  pending: "⚠️ Offene Anfragen",
  present: "🟢 Anwesend",
  late: "🟠 Verspätet",
  excused: "🟣 Entschuldigt",
  absent: "🔴 Fehlt",
  open: "⚪ Noch zu bearbeiten",
};
const WHATSAPP_ORDER: readonly AttendanceGroup[] = ["pending", "present", "late", "excused", "absent", "open"];

/** Teamstatus als WhatsApp-Nachricht, Aufbau wie v1 handleCopyWhatsApp. */
export function whatsappText(groups: GroupedMembers, ref: Date = new Date()): string {
  const day = ref.toLocaleDateString("de-DE", { timeZone: "Europe/Berlin" });
  const blocks = WHATSAPP_ORDER.filter((g) => groups[g].length > 0).map(
    (g) => `*${WHATSAPP[g]} (${groups[g].length})*\n${groups[g].map((m) => `- ${shortName(m.name)}`).join("\n")}`,
  );
  return [`*Team Status* (${day})`, ...blocks].join("\n\n");
}

/** Kurzbilanz für Kopfzeilen und die Teamleistung: wer arbeitet heute, wer fehlt. */
export interface TeamDaySummary {
  total: number;
  working: number;
  wakeup: number;
  sick: number;
  away: number;
  /** Noch nicht abgehakt (offen oder offene Anfrage). */
  todo: number;
}

export function teamDaySummary(members: readonly TeamMember[], ref: Date = new Date()): TeamDaySummary {
  const count = (s: string) => members.filter((m) => effectiveStatus(m, ref) === s).length;
  const groups = groupMembers(members, ref);
  return {
    total: members.length,
    working: count("active") + count("wakeup_inactive"),
    wakeup: count("wakeup_inactive"),
    sick: count("sick"),
    away: count("inactive"),
    todo: groups.pending.length + groups.open.length,
  };
}
