import { berlinDate, effectiveStatus, isStatusActiveOn, upcomingStatus, type DailyStatusFields } from "./dailyStatus";
import { inputDate, type StatusDraft } from "./statusPayload";

/**
 * Formular aus dem gespeicherten Status: der heute gültige oder ein geplanter (damit man Urlaub nachträglich
 * ändern kann). Ein abgelaufener Status startet wieder bei Aktiv und heute.
 */
export function draftOf(user: DailyStatusFields, ref: Date = new Date()): StatusDraft {
  const today = inputDate(ref);
  const upcoming = upcomingStatus(user, ref);
  const current = isStatusActiveOn(user, ref);
  if (!upcoming && !current) return { status: "active", reason: "", start: today, end: today };
  return {
    status: upcoming?.status ?? effectiveStatus(user, ref),
    reason: user.dailyStatusReason ?? "",
    start: berlinDate(user.dailyStatusStartDate) ?? today,
    end: berlinDate(user.dailyStatusEndDate) ?? today,
  };
}

/** Kurzes Datum für Anzeigen: "Fr., 24.10." */
export function formatShortDay(day: string): string {
  const [y = 0, m = 1, d = 1] = day.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit" });
}

/** Leitungen dürfen den Status anderer setzen und ohne Frist melden (v1 isAdminSettingStatus). */
export const isStatusLeader = (role: string) => role === "admin" || role === "teamleiter" || role === "strukturleiter";

/** Die Anwesenheitsliste sehen alle außer Beratern, sofern sie ein Team oder eine Struktur haben (v1). */
export function canTrackAttendance(role: string, teamId: unknown): boolean {
  if (role === "berater") return false;
  return Boolean(teamId) || role === "admin" || role === "strukturleiter";
}
