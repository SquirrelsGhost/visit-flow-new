import type { MonthRef } from "./logbookTypes";

interface Localized {
  locale: string;
  months: readonly string[];
  weekdays: readonly string[];
}

export const formatKm = (km: number, t: Localized) => `${Math.round(km).toLocaleString(t.locale)} km`;
export const formatNumber = (n: number, t: Localized) => Math.round(n).toLocaleString(t.locale);
export const formatEuro = (n: number, t: Localized) => new Intl.NumberFormat(t.locale, { style: "currency", currency: "EUR" }).format(n);

/** "2026-10-24" → "24.10.2026" (de) bzw. "24/10/2026" (en-GB). */
export function formatDate(date: string, t: Localized): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Intl.DateTimeFormat(t.locale, { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(y!, m! - 1, d!));
}
export const formatShortDate = (date: string, t: Localized) => formatDate(date, t).slice(0, 6).replace(/[./]$/, t.locale.startsWith("de") ? "." : "");
export const formatDateTime = (iso: string, t: Localized) =>
  new Intl.DateTimeFormat(t.locale, { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

export const monthLabel = (ref: MonthRef, t: Localized) => `${t.months[ref.month] ?? ""} ${ref.year}`;
export const weekdayOf = (date: string, t: Localized) => t.weekdays[new Date(`${date}T12:00:00`).getDay()] ?? "";

/** "08:40–09:05", nur Abfahrt oder leer. */
export const timeRange = (start: string, end: string) => (start && end ? `${start}–${end}` : start || end || "");
