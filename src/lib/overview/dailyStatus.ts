import type { GlassTone } from "../glass/glassTones";
import { DAILY_STATUSES, berlinDate, effectiveStatus, type DailyStatus } from "../team/dailyStatus";
import type { TeamUser } from "./teamTypes";

/** Hülle über lib/team/dailyStatus (eine Regel für alle Seiten), dazu die Kacheltexte der Übersicht. */
export type DailyStatusValue = DailyStatus;

export { DAILY_STATUSES };

interface DailyStatusMeta {
  label: string;
  hint: string;
  tone: GlassTone;
  /** Kleiner Punkt mit Schein (volle Klassen für Tailwind). */
  dot: string;
  isOut: boolean;
}

export const DAILY_STATUS_META: Record<DailyStatusValue, DailyStatusMeta> = {
  active: { label: "Aktiv", hint: "Arbeitet und battelt", tone: "green", dot: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]", isOut: false },
  wakeup_inactive: { label: "Wakeup", hint: "Vor Ort, bleibt in den Battles", tone: "blue", dot: "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]", isOut: false },
  sick: { label: "Krank", hint: "Fällt aus, nicht in den Battles", tone: "rose", dot: "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]", isOut: true },
  inactive: { label: "Urlaub / Frei", hint: "Fällt aus, nicht in den Battles", tone: "amber", dot: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]", isOut: true },
};

/** JJJJ-MM-TT in Europe/Berlin; die Regel steht einmal in lib/team/dailyStatus (wie v1 getBerlinDateString). */
export { berlinDate };

/** Der Status, der heute gilt; abgelaufene oder künftige Abwesenheiten zählen als Aktiv (v1 getEffectiveDailyStatus). */
export function effectiveDailyStatus(user: Pick<TeamUser, "dailyStatus" | "dailyStatusStartDate" | "dailyStatusEndDate" | "dailyStatusUpdatedAt">, ref = new Date()): DailyStatusValue {
  return effectiveStatus(user, ref);
}
