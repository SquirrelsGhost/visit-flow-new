import { daysInMonth, monthId, tripOrder } from "./logbookDates";
import { KM_RATE, type KindTotals, type MonthRef, type MonthSummary, type Trip, type TripKind } from "./logbookTypes";

export const tripKm = (t: Pick<Trip, "startKm" | "endKm">) => Math.max(0, t.endKm - t.startKm);

/** Chronologisch: Tag, Abfahrt, Kilometerstand. */
export const sortTrips = <T extends Trip>(trips: readonly T[]) => [...trips].sort((a, b) => tripOrder(a).localeCompare(tripOrder(b)));

export const tripsInMonth = (trips: readonly Trip[], ref: MonthRef) => {
  const id = monthId(ref);
  return sortTrips(trips.filter((t) => t.date.startsWith(id)));
};

export const tripsInYear = (trips: readonly Trip[], year: number) => sortTrips(trips.filter((t) => t.date.startsWith(`${year}-`)));

export function kindTotals(trips: readonly Trip[]): KindTotals {
  const totals: KindTotals = { business: 0, private: 0, commute: 0 };
  for (const t of trips) totals[t.kind] += tripKm(t);
  return totals;
}

/** Kennzahlen eines Zeitraums für Kopfkarte und Export. */
export function summarize(trips: readonly Trip[]): MonthSummary {
  const byKind = kindTotals(trips);
  const totalKm = byKind.business + byKind.private + byKind.commute;
  return {
    totalKm,
    byKind,
    trips: trips.length,
    days: new Set(trips.map((t) => t.date)).size,
    businessShare: totalKm > 0 ? byKind.business / totalKm : 0,
    allowance: Math.round(byKind.business * KM_RATE * 100) / 100,
  };
}

export interface TripDay {
  date: string;
  trips: Trip[];
  km: number;
}

/** Fahrten je Tag, neuester Tag oben; innerhalb des Tages in Fahrtreihenfolge. */
export function groupByDay(trips: readonly Trip[]): TripDay[] {
  const days = new Map<string, Trip[]>();
  for (const t of sortTrips(trips)) days.set(t.date, [...(days.get(t.date) ?? []), t]);
  return [...days.entries()].reverse().map(([date, list]) => ({ date, trips: list, km: list.reduce((sum, t) => sum + tripKm(t), 0) }));
}

export interface DayBar {
  day: number;
  byKind: KindTotals;
  total: number;
}

/** Kilometer je Kalendertag des Monats, nach Art gestapelt, für das Balkendiagramm. */
export function dailyBars(trips: readonly Trip[], ref: MonthRef): DayBar[] {
  const bars: DayBar[] = Array.from({ length: daysInMonth(ref) }, (_, i) => ({ day: i + 1, byKind: { business: 0, private: 0, commute: 0 }, total: 0 }));
  for (const t of tripsInMonth(trips, ref)) {
    const bar = bars[Number(t.date.slice(8, 10)) - 1];
    if (!bar) continue;
    bar.byKind[t.kind] += tripKm(t);
    bar.total += tripKm(t);
  }
  return bars;
}

/** Letzter bekannter Kilometerstand eines Fahrzeugs, als Start der nächsten Fahrt. */
export function lastEndKm(trips: readonly Trip[], vehicleId: string): number | undefined {
  const own = sortTrips(trips.filter((t) => t.vehicleId === vehicleId));
  return own[own.length - 1]?.endKm;
}

/** Letzte Fahrt eines Fahrzeugs vor einem Zeitpunkt; daraus kommt der Startort der nächsten. */
export function previousTrip(trips: readonly Trip[], vehicleId: string, date: string, time: string): Trip | undefined {
  const key = `${date} ${time || "99:99"}`;
  const before = sortTrips(trips.filter((t) => t.vehicleId === vehicleId && `${t.date} ${t.startTime || "99:99"}` <= key));
  return before[before.length - 1];
}

/** Häufigste Werte eines Feldes (Ziele, Zwecke) für die Vorschläge im Formular. */
export function frequent(trips: readonly Trip[], field: "to" | "purpose" | "from", limit = 6): string[] {
  const counts = new Map<string, number>();
  for (const t of trips) {
    const v = t[field].trim();
    if (v) counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([v]) => v);
}

export const KIND_ORDER: readonly TripKind[] = ["business", "commute", "private"];
