import type { DailyStatus } from "./dailyStatus";
import type { Attendance, MemberPatch } from "./teamTypes";

export interface StatusDraft {
  status: DailyStatus;
  reason: string;
  /** JJJJ-MM-TT */
  start: string;
  end: string;
}

/** Lokales Datum JJJJ-MM-TT (für die Datumsfelder). */
export function inputDate(d: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function addDays(day: string, days: number): string {
  const [y = 0, m = 1, d = 1] = day.split("-").map(Number);
  return inputDate(new Date(y, m - 1, d + days));
}

/**
 * Frühester Starttag. Berater dürfen Urlaub und Wakeup wie in v1 erst ab morgen melden (für heute über den
 * Strukturleiter, Frist gestern 23:59); krank geht immer ab heute. Leitungen dürfen jeden Tag setzen.
 */
export function minStart(status: DailyStatus, isLeader: boolean, today: string = inputDate()): string | undefined {
  if (isLeader || status === "active" || status === "sick") return undefined;
  return addDays(today, 1);
}

/** Hält Von und Bis gültig: Bis nie vor Von, Von nie vor dem frühesten Tag. */
export function clampDraft(draft: StatusDraft, isLeader: boolean, today: string = inputDate()): StatusDraft {
  const min = minStart(draft.status, isLeader, today);
  const start = min && draft.start < min ? min : draft.start;
  return { ...draft, start, end: draft.end < start ? start : draft.end };
}

/**
 * Was gespeichert wird, wie v1 DailyStatusDialog: Zeitraum bis Tagesende, bei Aktiv alles leeren.
 * Setzt eine Leitung den Status für jemand anderen, gilt Krank (und Urlaub mit Grund) gleich als entschuldigt,
 * sonst erscheint die Meldung in der Anwesenheitsliste als offene Anfrage.
 */
export function statusPatch(draft: StatusDraft, forOther: boolean, now: Date = new Date()): MemberPatch {
  const stamp = now.toISOString();
  if (draft.status === "active") {
    return { dailyStatus: "active", dailyStatusUpdatedAt: stamp, dailyStatusReason: "", dailyStatusStartDate: null, dailyStatusEndDate: null };
  }
  const reason = draft.reason.trim();
  const [y = 0, m = 1, d = 1] = draft.end.split("-").map(Number);
  const [sy = 0, sm = 1, sd = 1] = draft.start.split("-").map(Number);
  const patch: MemberPatch = {
    dailyStatus: draft.status,
    dailyStatusUpdatedAt: stamp,
    dailyStatusReason: reason,
    dailyStatusStartDate: new Date(sy, sm - 1, sd).toISOString(),
    dailyStatusEndDate: new Date(y, m - 1, d, 23, 59, 59, 999).toISOString(),
  };
  const excuse = forOther && (draft.status === "sick" || (draft.status === "inactive" && reason.length > 0));
  if (excuse) {
    patch.dailyAttendance = "excused";
    patch.dailyAttendanceReason = reason || "Krank";
    patch.dailyAttendanceUpdatedAt = stamp;
  }
  return patch;
}

/** Anwesenheit setzen oder (null) für heute zurücknehmen, mit Minuten bzw. Grund wie v1. */
export function attendancePatch(next: Attendance | null, extra?: string, now: Date = new Date()): MemberPatch {
  const stamp = now.toISOString();
  if (!next) return { dailyAttendance: null, dailyAttendanceMinutesLate: null, dailyAttendanceReason: null, dailyAttendanceUpdatedAt: stamp };
  const patch: MemberPatch = { dailyAttendance: next, dailyAttendanceUpdatedAt: stamp };
  if (next === "late") patch.dailyAttendanceMinutesLate = Math.max(0, parseInt(extra ?? "", 10) || 0);
  if (next === "excused") patch.dailyAttendanceReason = extra?.trim() ?? "";
  return patch;
}
