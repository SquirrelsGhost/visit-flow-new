import type { GlassTone } from "../glass/glassTones";

/**
 * Tagesstatus, eine Quelle für alle Ansichten (v1 shared/utils/dailyStatus.ts, Spiegel des Servers).
 * Ein Status außerhalb seines Zeitraums gilt als Aktiv; Wakeup bleibt in den Battles, Krank und Urlaub nicht.
 */
export const DAILY_STATUSES = ["active", "wakeup_inactive", "sick", "inactive"] as const;

export type DailyStatus = (typeof DAILY_STATUSES)[number];

export interface DailyStatusFields {
  dailyStatus?: string | null;
  dailyStatusReason?: string | null;
  dailyStatusStartDate?: string | null;
  dailyStatusEndDate?: string | null;
  dailyStatusUpdatedAt?: string | null;
}

export const isDailyStatus = (value: unknown): value is DailyStatus => typeof value === "string" && (DAILY_STATUSES as readonly string[]).includes(value);

/** Datum JJJJ-MM-TT in Europe/Berlin, wie v1 getBerlinDateString. */
export function berlinDate(value?: Date | string | number | null): string | null {
  if (value === null || value === undefined || value === "") return null;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" });
}

/** Gilt der gespeicherte Status am Stichtag? Mit Zeitraum zählt der Zeitraum, sonst nur der Tag der Meldung. */
export function isStatusActiveOn(user: DailyStatusFields, ref: Date = new Date()): boolean {
  if (!isDailyStatus(user.dailyStatus) || user.dailyStatus === "active") return false;
  const today = berlinDate(ref);
  const start = berlinDate(user.dailyStatusStartDate);
  const end = berlinDate(user.dailyStatusEndDate);
  if (start && end && today) return today >= start && today <= end;
  const updated = berlinDate(user.dailyStatusUpdatedAt);
  return Boolean(updated && today && updated === today);
}

/** Status, der heute wirklich gilt. */
export function effectiveStatus(user: DailyStatusFields, ref: Date = new Date()): DailyStatus {
  return isStatusActiveOn(user, ref) ? (user.dailyStatus as DailyStatus) : "active";
}

/** Nur Krank und Urlaub nehmen jemanden aus den Battles, Wakeup bleibt drin. */
export const isOutOfBattles = (user: DailyStatusFields, ref: Date = new Date()) => {
  const status = effectiveStatus(user, ref);
  return status === "sick" || status === "inactive";
};

export interface UpcomingStatus {
  status: DailyStatus;
  start: string;
  end: string | null;
}

/** Eine geplante Abwesenheit, die erst nach dem Stichtag beginnt. */
export function upcomingStatus(user: DailyStatusFields, ref: Date = new Date()): UpcomingStatus | null {
  if (!isDailyStatus(user.dailyStatus) || user.dailyStatus === "active" || isStatusActiveOn(user, ref)) return null;
  const start = berlinDate(user.dailyStatusStartDate);
  const today = berlinDate(ref);
  if (!start || !today || start <= today) return null;
  return { status: user.dailyStatus, start, end: berlinDate(user.dailyStatusEndDate) };
}

/** Zeitraum des Status heute oder des geplanten; ohne Zeitraum der Tag der Meldung. */
export function statusWindow(user: DailyStatusFields): { start: string; end: string } | null {
  const start = berlinDate(user.dailyStatusStartDate) ?? berlinDate(user.dailyStatusUpdatedAt);
  const end = berlinDate(user.dailyStatusEndDate) ?? start;
  return start && end ? { start, end } : null;
}

export interface StatusMeta {
  tone: GlassTone;
  /** Farbe des leuchtenden Punkts (Verlauf von hell nach satt). */
  dot: string;
  /** Leuchten um den Punkt. */
  glow: string;
  /** Rand und Hauch der gewählten Kachel. */
  selected: string;
  isOut: boolean;
}

/** Farben je Status, gleiche Familien wie v1 (Grün, Blau, Rosa, Bernstein). Vollständige Klassen für Tailwind. */
export const STATUS_META: Record<DailyStatus, StatusMeta> = {
  active: {
    tone: "green",
    dot: "bg-gradient-to-br from-emerald-300 to-emerald-500",
    glow: "shadow-[0_0_14px_rgba(16,185,129,0.8)]",
    selected: "ring-emerald-500/50 bg-emerald-500/[0.08] shadow-[0_14px_30px_-18px_rgba(16,185,129,0.8)]",
    isOut: false,
  },
  wakeup_inactive: {
    tone: "blue",
    dot: "bg-gradient-to-br from-sky-300 to-blue-500",
    glow: "shadow-[0_0_14px_rgba(59,130,246,0.8)]",
    selected: "ring-blue-500/50 bg-blue-500/[0.08] shadow-[0_14px_30px_-18px_rgba(59,130,246,0.8)]",
    isOut: false,
  },
  sick: {
    tone: "rose",
    dot: "bg-gradient-to-br from-pink-300 to-rose-500",
    glow: "shadow-[0_0_14px_rgba(244,63,94,0.8)]",
    selected: "ring-rose-500/50 bg-rose-500/[0.08] shadow-[0_14px_30px_-18px_rgba(244,63,94,0.8)]",
    isOut: true,
  },
  inactive: {
    tone: "amber",
    dot: "bg-gradient-to-br from-yellow-200 to-amber-500",
    glow: "shadow-[0_0_14px_rgba(245,158,11,0.8)]",
    selected: "ring-amber-500/50 bg-amber-500/[0.08] shadow-[0_14px_30px_-18px_rgba(245,158,11,0.8)]",
    isOut: true,
  },
};
