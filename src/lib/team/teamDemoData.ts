import { withDemoPatches } from "../overview/memberApi";
import { demoTeamUsers } from "../overview/teamDemoData";
import type { TeamUser } from "../overview/teamTypes";
import { addDays, inputDate } from "./statusPayload";
import type { MemberPatch, TeamMember } from "./teamTypes";

/**
 * Beispielteam für Tagesstatus und Teamleistung: dasselbe Team wie in der Verwaltung der Übersicht
 * (demoTeamUsers, Änderungen im Tab über memberApi), dazu ein abgehakter Morgen als Startwert.
 * Noah ist überall heute krank gemeldet, auch in der Demo-Arena.
 */
function morning(): Record<string, MemberPatch> {
  const now = new Date();
  const today = inputDate(now);
  const at = (h: number, m: number) => new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m).toISOString();
  const day = (d: string) => new Date(`${d}T00:00:00`).toISOString();
  return {
    b1: { dailyAttendance: "present", dailyAttendanceUpdatedAt: at(8, 58) },
    b2: { dailyAttendance: "present", dailyAttendanceUpdatedAt: at(8, 55) },
    b6: { dailyAttendance: "present", dailyAttendanceUpdatedAt: at(9, 1) },
    b8: { dailyAttendance: "late", dailyAttendanceMinutesLate: 12, dailyAttendanceUpdatedAt: at(9, 14) },
    b3: {
      dailyStatus: "wakeup_inactive",
      dailyStatusReason: "Kundentermin am Vormittag",
      dailyStatusStartDate: day(today),
      dailyStatusEndDate: day(today),
      dailyStatusUpdatedAt: at(7, 30),
      dailyAttendance: "excused",
      dailyAttendanceReason: "Wakeup",
      dailyAttendanceUpdatedAt: at(8, 40),
    },
    b5: { dailyStatus: "inactive", dailyStatusReason: "Urlaub", dailyStatusStartDate: day(addDays(today, 5)), dailyStatusEndDate: day(addDays(today, 9)), dailyStatusUpdatedAt: at(7, 0) },
  };
}

export function demoMembers(): TeamMember[] {
  const start = morning();
  const users = demoTeamUsers().map((u) => ({ ...u, ...start[u.id] }) as TeamMember);
  // Änderungen aus Tagesstatus und Verwaltung liegen gemeinsam im Tab und gewinnen über den Startwert
  return withDemoPatches({ users: users as unknown as TeamUser[], products: [], doors: [] }).users as unknown as TeamMember[];
}

export function demoMember(id: string): TeamMember | undefined {
  return demoMembers().find((m) => m.id === id);
}
