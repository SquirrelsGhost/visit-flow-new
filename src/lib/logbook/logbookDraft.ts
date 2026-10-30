import { isoDay, nowTime } from "./logbookDates";
import { lastEndKm, previousTrip } from "./logbookLogic";
import { MAX_TRIP_KM, type LogbookData, type Trip, type TripFields, type TripKind, type TripSource } from "./logbookTypes";

/** Formularstand: Kilometer als Text, damit leere und halbe Eingaben möglich sind. */
export interface TripDraft extends Omit<TripFields, "startKm" | "endKm"> {
  startKm: string;
  endKm: string;
}

export type DraftError = "required" | "kmOrder" | "kmTooFar" | "timeOrder" | "number" | "locked";
export type DraftErrors = Partial<Record<keyof TripDraft, DraftError>>;

const kmText = (n: number | undefined) => (n === undefined ? "" : String(n));

/**
 * Neue Fahrt: Kilometerstand und Startort setzen die letzte Fahrt fort (v1: Kilometerstand aus den
 * Einstellungen, nach jeder Route fortgeschrieben). Ohne Fahrten gilt der Stand aus den Einstellungen.
 */
export function newDraft(data: LogbookData, settingsKm: number | undefined, now = new Date(), kind: TripKind = "business"): TripDraft {
  const vehicleId = data.activeVehicleId;
  const date = isoDay(now);
  const time = nowTime(now);
  const prev = previousTrip(data.trips, vehicleId, date, time);
  return {
    date,
    startTime: time,
    endTime: "",
    startKm: kmText(prev?.endKm ?? lastEndKm(data.trips, vehicleId) ?? settingsKm),
    endKm: "",
    kind,
    from: prev?.to || prev?.from || "",
    to: "",
    purpose: "",
    partner: "",
    detour: "",
    vehicleId,
  };
}

export const draftOf = (t: TripFields): TripDraft => ({ ...t, startKm: kmText(t.startKm), endKm: kmText(t.endKm) });

/** Rückfahrt: gleiche Art, Orte getauscht, Kilometerstand läuft weiter. */
export const returnDraft = (t: Trip, now = new Date()): TripDraft => ({
  ...draftOf(t),
  date: t.date,
  startTime: t.endTime || nowTime(now),
  endTime: "",
  startKm: kmText(t.endKm),
  endKm: "",
  from: t.to,
  to: t.from,
  partner: "",
  detour: "",
});

const parseKm = (s: string) => (/^\d{1,7}$/.test(s.trim()) ? Number(s.trim()) : NaN);

export function validateDraft(d: TripDraft): DraftErrors {
  const errors: DraftErrors = {};
  const start = parseKm(d.startKm);
  const end = parseKm(d.endKm);
  if (!d.date) errors.date = "required";
  if (d.startKm.trim() === "") errors.startKm = "required";
  else if (Number.isNaN(start)) errors.startKm = "number";
  if (d.endKm.trim() === "") errors.endKm = "required";
  else if (Number.isNaN(end)) errors.endKm = "number";
  else if (!Number.isNaN(start) && end <= start) errors.endKm = "kmOrder";
  else if (!Number.isNaN(start) && end - start > MAX_TRIP_KM) errors.endKm = "kmTooFar";
  if (d.startTime && d.endTime && d.endTime < d.startTime) errors.endTime = "timeOrder";
  if (d.kind === "business") {
    if (!d.to.trim()) errors.to = "required";
    if (!d.purpose.trim()) errors.purpose = "required";
  }
  return errors;
}

export function toFields(d: TripDraft): TripFields {
  const trim = (s: string) => s.trim();
  return { ...d, from: trim(d.from), to: trim(d.to), purpose: trim(d.purpose), partner: trim(d.partner), detour: trim(d.detour), startKm: parseKm(d.startKm), endKm: parseKm(d.endKm) };
}

const newId = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `trip-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);

export function createTrip(fields: TripFields, driver: string, source: TripSource = "manual", now = new Date()): Trip {
  return { ...fields, id: newId(), driver, source, createdAt: now.toISOString(), revisions: [] };
}

const FIELD_KEYS: readonly (keyof TripFields)[] = ["date", "startTime", "endTime", "startKm", "endKm", "kind", "from", "to", "purpose", "partner", "detour", "vehicleId"];

export const pickFields = (t: TripFields): TripFields => Object.fromEntries(FIELD_KEYS.map((k) => [k, t[k]])) as unknown as TripFields;

/** Änderung mit Protokoll: die alte Fassung wandert in die Revisionen, nichts wird still überschrieben. */
export function reviseTrip(trip: Trip, fields: TripFields, now = new Date()): Trip {
  const before = pickFields(trip);
  if (FIELD_KEYS.every((k) => before[k] === fields[k])) return trip;
  const at = now.toISOString();
  return { ...trip, ...fields, updatedAt: at, revisions: [...trip.revisions, { at, before }] };
}

/** Kilometerlücke als Privatfahrt nachtragen (Finanzamt: nicht erfasste km gelten sonst als ungeklärt). */
export function gapTrip(date: string, time: string, fromKm: number, toKm: number, vehicleId: string, driver: string, now = new Date()): Trip {
  const fields: TripFields = { date, startTime: time, endTime: "", startKm: fromKm, endKm: toKm, kind: "private", from: "", to: "", purpose: "", partner: "", detour: "", vehicleId };
  return createTrip(fields, driver, "gap", now);
}
