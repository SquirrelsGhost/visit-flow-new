import type { AdminBattle } from "./battleTypes";

/** Reihenfolge der Status-Filter in der Historie. */
export const LOG_STATUSES = ["active", "completed", "cancelled_sick", "declined", "expired"] as const;

export type LogFilter = "all" | (typeof LOG_STATUSES)[number];

/** Battles nach Name (Challenger oder Opponent) und Status filtern. */
export function filterBattles(battles: AdminBattle[], query: string, status: LogFilter): AdminBattle[] {
  const q = query.trim().toLowerCase();
  return battles.filter(
    (b) =>
      (status === "all" || b.status === status) &&
      (!q || b.challengerName?.toLowerCase().includes(q) || b.opponentName?.toLowerCase().includes(q)),
  );
}

/** Anzahl je Status; nur Status, die es an dem Tag gibt, tauchen auf. */
export function statusCounts(battles: AdminBattle[]): Partial<Record<LogFilter, number>> {
  const counts: Partial<Record<LogFilter, number>> = {};
  for (const b of battles) {
    const key = (LOG_STATUSES as readonly string[]).includes(b.status) ? (b.status as LogFilter) : null;
    if (key) counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

/** Kalendertag (YYYY-MM-DD) um `delta` Tage verschieben. */
export function shiftDay(day: string, delta: number): string {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

/** "Heute", "Gestern" oder kurz "Do., 22.10.". */
export function dayLabel(day: string, today: string, words: { today: string; yesterday: string }): string {
  if (day === today) return words.today;
  if (day === shiftDay(today, -1)) return words.yesterday;
  return new Date(`${day}T12:00:00Z`).toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit", timeZone: "UTC" });
}

/** Wer vorne liegt bzw. gewonnen hat; null bei Gleichstand. */
export function leadingSide(b: AdminBattle): "challenger" | "opponent" | null {
  const a = b.challengerScore || 0;
  const o = b.opponentScore || 0;
  if (a === o) return null;
  return a > o ? "challenger" : "opponent";
}
