import type { MonthRef } from "./logbookTypes";

const pad = (n: number) => String(n).padStart(2, "0");

/** Lokales Datum als yyyy-MM-dd (nicht toISOString, das wäre UTC und kippt nachts den Tag). */
export const isoDay = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const nowTime = (d = new Date()) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

/** "2026-10" für Monat 9 (Oktober) des Jahres 2026. */
export const monthId = ({ month, year }: MonthRef) => `${year}-${pad(month + 1)}`;
export const monthOf = (date: string): MonthRef => ({ year: Number(date.slice(0, 4)), month: Number(date.slice(5, 7)) - 1 });
export const monthKey = ({ month, year }: MonthRef) => year * 12 + month;
export const shiftMonth = (ref: MonthRef, by: number): MonthRef => {
  const key = monthKey(ref) + by;
  return { month: ((key % 12) + 12) % 12, year: Math.floor(key / 12) };
};
export const daysInMonth = ({ month, year }: MonthRef) => new Date(year, month + 1, 0).getDate();
export const currentMonth = (now = new Date()): MonthRef => ({ month: now.getMonth(), year: now.getFullYear() });

/** Ganze Tage zwischen zwei Kalendertagen (b − a). */
export function daysBetween(a: string, b: string): number {
  const ms = Date.UTC(+b.slice(0, 4), +b.slice(5, 7) - 1, +b.slice(8, 10)) - Date.UTC(+a.slice(0, 4), +a.slice(5, 7) - 1, +a.slice(8, 10));
  return Math.round(ms / 86_400_000);
}

/** Sortierschlüssel: Tag, dann Abfahrt, dann Kilometerstand. */
export const tripOrder = (t: { date: string; startTime: string; startKm: number }) => `${t.date} ${t.startTime || "99:99"} ${String(t.startKm).padStart(8, "0")}`;
