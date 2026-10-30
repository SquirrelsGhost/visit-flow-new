import { currentMonth, daysBetween, isoDay, monthId, monthKey } from "./logbookDates";
import { sortTrips } from "./logbookLogic";
import { LATE_AFTER_DAYS, type LogbookData, type LogbookIssue, type MonthRef, type Trip, type TripFields } from "./logbookTypes";

/**
 * Pflichtangaben je Fahrtart (BMF-Schreiben zum ordnungsgemäßen Fahrtenbuch): privat reichen die Kilometer.
 * Der Geschäftspartner ist bei Rückfahrten und Gebietsarbeit oft nicht eindeutig, er bleibt deshalb ein Hinweis im Formular.
 */
const REQUIRED: Record<Trip["kind"], (keyof TripFields)[]> = {
  business: ["to", "purpose"],
  commute: [],
  private: [],
};

export const missingFields = (t: TripFields) => REQUIRED[t.kind].filter((f) => String(t[f]).trim() === "");

export const isLocked = (data: LogbookData, ref: MonthRef) => Boolean(data.locks[monthId(ref)]?.lockedAt);
export const isTripLocked = (data: LogbookData, trip: Pick<Trip, "date">) => Boolean(data.locks[trip.date.slice(0, 7)]?.lockedAt);

/** Lücken und Überschneidungen im Kilometerstand je Fahrzeug, über den Monatswechsel hinweg. */
function chainIssues(trips: readonly Trip[], id: string): LogbookIssue[] {
  const issues: LogbookIssue[] = [];
  const byVehicle = new Map<string, Trip[]>();
  for (const t of trips) byVehicle.set(t.vehicleId, [...(byVehicle.get(t.vehicleId) ?? []), t]);
  for (const list of byVehicle.values()) {
    const sorted = sortTrips(list);
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1]!;
      const t = sorted[i]!;
      if (!t.date.startsWith(id) || prev.endKm === t.startKm) continue;
      const kind = t.startKm > prev.endKm ? "gap" : "overlap";
      issues.push({ kind, tripId: t.id, date: t.date, km: Math.abs(t.startKm - prev.endKm), fromKm: prev.endKm, toKm: t.startKm, afterDate: prev.date, afterTime: prev.endTime || prev.startTime });
    }
  }
  return issues;
}

/**
 * Finanzamt-Check eines Monats: lückenlose Kilometer, vollständige Angaben bei Dienstfahrten,
 * zeitnahe Erfassung und abgeschlossene Vormonate. Ergebnis chronologisch.
 */
export function checkMonth(data: LogbookData, ref: MonthRef, now = new Date()): LogbookIssue[] {
  const id = monthId(ref);
  const inMonth = data.trips.filter((t) => t.date.startsWith(id));
  const issues = chainIssues(data.trips, id);
  for (const t of inMonth) {
    const fields = missingFields(t);
    if (fields.length > 0) issues.push({ kind: "missing", tripId: t.id, date: t.date, fields });
    if (t.source === "manual" && daysBetween(t.date, isoDay(new Date(t.createdAt))) > LATE_AFTER_DAYS) issues.push({ kind: "late", tripId: t.id, date: t.date });
  }
  issues.sort((a, b) => a.date.localeCompare(b.date));
  const past = monthKey(ref) < monthKey(currentMonth(now));
  if (past && inMonth.length > 0 && !isLocked(data, ref)) issues.unshift({ kind: "unlocked", date: `${id}-01` });
  return issues;
}

/** Schwere eines Hinweises: blockierende Fehler zuerst (rot), dann Hinweise (gelb). */
export const isBlocking = (issue: LogbookIssue) => issue.kind === "gap" || issue.kind === "overlap" || issue.kind === "missing";
