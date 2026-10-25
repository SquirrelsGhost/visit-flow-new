import { tripFieldsSchema, type LogbookLockDto, type LogbookTripDto, type LogbookTripFieldsDto } from "@visit-flow/shared/logbookSchema";
import { badRequest, forbidden } from "../../lib/http/HttpError";

/** Inhalt eines Monats, wie er verschlüsselt gespeichert wird. */
export interface MonthContent {
  trips: LogbookTripDto[];
  lock: LogbookLockDto | null;
}

/** Vergleich unabhängig von der Reihenfolge der Schlüssel. */
function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value).filter(([, v]) => v !== undefined).sort(([a], [b]) => a.localeCompare(b));
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${stable(v)}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

const TRIP_FIELD_KEYS = Object.keys(tripFieldsSchema.shape) as (keyof LogbookTripFieldsDto)[];
const byId = (trips: LogbookTripDto[]) => [...trips].sort((a, b) => a.id.localeCompare(b.id));
/** Nur die fachlichen Felder einer Fahrt, ohne Verwaltungsfelder. */
export function tripFieldsOf(trip: LogbookTripDto): LogbookTripFieldsDto {
  return Object.fromEntries(TRIP_FIELD_KEYS.map((key) => [key, trip[key]])) as LogbookTripFieldsDto;
}
const isPrefix = <T>(head: T[], full: T[]) => head.length <= full.length && head.every((item, i) => stable(item) === stable(full[i]));
const isLocked = (lock: LogbookLockDto | null | undefined) => Boolean(lock?.lockedAt);

function checkShape(month: string, next: MonthContent): void {
  const ids = new Set<string>();
  for (const trip of next.trips) {
    if (!trip.date.startsWith(`${month}-`)) throw badRequest("Fahrt liegt nicht in diesem Monat", { trips: trip.id });
    if (ids.has(trip.id)) throw badRequest("Fahrt ist doppelt", { trips: trip.id });
    ids.add(trip.id);
  }
}

/** Abschlussprotokoll: Wiederöffnungen werden nur angehängt, ein abgeschlossener Monat nur mit Grund geöffnet. */
function checkLock(prev: LogbookLockDto | null, next: LogbookLockDto | null): void {
  if (!prev) return;
  if (!next || !isPrefix(prev.reopened, next.reopened)) throw forbidden("Das Abschlussprotokoll kann nicht geändert werden");
  if (isLocked(prev) && !isLocked(next) && next.reopened.length !== prev.reopened.length + 1) {
    throw forbidden("Wiederöffnen braucht einen Grund");
  }
}

/** Änderungen an einer Fahrt bleiben als frühere Fassung sichtbar (GoBD: nachvollziehbar, unveränderbar). */
function checkHistory(prev: LogbookTripDto[], next: LogbookTripDto[]): void {
  const nextById = new Map(next.map((trip) => [trip.id, trip]));
  for (const before of prev) {
    const after = nextById.get(before.id);
    if (!after) continue;
    const sameOrigin = after.createdAt === before.createdAt && after.source === before.source && after.driver === before.driver;
    const keptHistory = isPrefix(before.revisions, after.revisions);
    const changed = stable(tripFieldsOf(before)) !== stable(tripFieldsOf(after));
    if (!sameOrigin || !keptHistory || (changed && after.revisions.length === before.revisions.length)) {
      throw forbidden("Änderungen an einer Fahrt müssen nachvollziehbar bleiben", { tripId: before.id });
    }
  }
}

/**
 * Prüft einen neuen Monatsstand gegen den gespeicherten. Der Server setzt die Regeln selbst durch,
 * damit ein abgeschlossener Monat auch mit einem veränderten Client nicht still umgeschrieben wird.
 */
export function checkMonthChange(month: string, prev: MonthContent | null, next: MonthContent): void {
  checkShape(month, next);
  if (!prev) return;
  checkLock(prev.lock, next.lock);
  if (isLocked(prev.lock) && stable(byId(prev.trips)) !== stable(byId(next.trips))) {
    throw forbidden("Der Monat ist abgeschlossen. Öffne ihn mit Grund, um Fahrten zu ändern");
  }
  checkHistory(prev.trips, next.trips);
}
