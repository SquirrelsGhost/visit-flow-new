import type { LogbookData, MonthLock, Trip } from "./logbookTypes";

/**
 * Auf dem Server liegt das Fahrtenbuch je Monat. Hier wird das lokale Buch in Monate zerlegt,
 * ein Monat ersetzt und ein Konflikt zwischen zwei Geräten zusammengeführt.
 */
export interface MonthContent {
  trips: Trip[];
  lock: MonthLock | null;
}

export const monthOfTrip = (trip: Trip) => trip.date.slice(0, 7);

/** Vergleich unabhängig von der Reihenfolge der Schlüssel und Fahrten. */
export function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value).filter(([, v]) => v !== undefined).sort(([a], [b]) => a.localeCompare(b));
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${stableJson(v)}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

export const sameContent = (a: MonthContent, b: MonthContent) =>
  stableJson({ ...a, trips: [...a.trips].sort((x, y) => x.id.localeCompare(y.id)) }) ===
  stableJson({ ...b, trips: [...b.trips].sort((x, y) => x.id.localeCompare(y.id)) });

export function monthKeys(data: LogbookData): string[] {
  return [...new Set([...data.trips.map(monthOfTrip), ...Object.keys(data.locks)])].sort();
}

export function monthContent(data: LogbookData, month: string): MonthContent {
  return { trips: data.trips.filter((trip) => monthOfTrip(trip) === month), lock: data.locks[month] ?? null };
}

export function withMonth(data: LogbookData, month: string, content: MonthContent): LogbookData {
  const locks = { ...data.locks };
  if (content.lock) locks[month] = content.lock;
  else delete locks[month];
  return { ...data, trips: [...data.trips.filter((trip) => monthOfTrip(trip) !== month), ...content.trips], locks };
}

const stamp = (trip: Trip) => trip.updatedAt ?? trip.createdAt;
const newer = (a: Trip, b: Trip) =>
  a.revisions.length !== b.revisions.length ? (a.revisions.length > b.revisions.length ? a : b) : stamp(a) >= stamp(b) ? a : b;

/**
 * Zwei Geräte haben denselben Monat geändert. Ein auf dem Server abgeschlossener Monat gilt wie er ist.
 * Sonst bleiben die Fahrten beider Seiten; bei derselben Fahrt gewinnt die mit mehr Fassungen bzw. die neuere.
 * Annahme: Eine auf dem anderen Gerät gelöschte Fahrt, die hier noch liegt, kommt zurück (lieber zu viel als verloren).
 */
export function mergeMonth(local: MonthContent, server: MonthContent): MonthContent {
  if (server.lock?.lockedAt) return server;
  const byId = new Map(server.trips.map((trip) => [trip.id, trip]));
  for (const trip of local.trips) {
    const other = byId.get(trip.id);
    byId.set(trip.id, other ? newer(trip, other) : trip);
  }
  const lock = local.lock ?? server.lock;
  const reopened = (server.lock?.reopened.length ?? 0) > (lock?.reopened.length ?? 0) ? server.lock!.reopened : lock?.reopened;
  return { trips: [...byId.values()], lock: lock ? { lockedAt: lock.lockedAt, reopened: reopened ?? [] } : null };
}
