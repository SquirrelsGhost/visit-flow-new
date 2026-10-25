import { z } from "zod";

/**
 * Fahrtenbuch zwischen App und API. Gespeichert wird je Nutzer und Monat ein Datensatz,
 * damit jede Anfrage klein bleibt (Bodygrenze für /api/logbook: 1 MB) und zwei Geräte
 * nur dann in Konflikt geraten, wenn sie denselben Monat ändern.
 * Die Felder folgen dem Client-Modell (lib/logbook/logbookTypes.ts in der App).
 */

export const TRIP_KIND_VALUES = ["business", "private", "commute"] as const;
export const TRIP_SOURCE_VALUES = ["manual", "v1", "gap"] as const;
export const MAX_TRIPS_PER_MONTH = 400;
export const MAX_VEHICLES = 10;

const text = z.string().max(500);
const shortText = z.string().max(120);
const km = z.number().int().min(0).max(9_999_999);
const isoTime = z.string().max(40);
const time = z.union([z.literal(""), z.string().regex(/^\d{2}:\d{2}$/)]);

export const monthKeySchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);

export const tripFieldsSchema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    startTime: time,
    endTime: time,
    startKm: km,
    endKm: km,
    kind: z.enum(TRIP_KIND_VALUES),
    from: text,
    to: text,
    purpose: text,
    partner: text,
    detour: text,
    vehicleId: shortText,
  })
  .strict();

export const tripSchema = tripFieldsSchema
  .extend({
    id: z.string().min(1).max(80),
    driver: shortText,
    source: z.enum(TRIP_SOURCE_VALUES),
    createdAt: isoTime,
    updatedAt: isoTime.optional(),
    revisions: z.array(z.object({ at: isoTime, before: tripFieldsSchema }).strict()).max(200),
  })
  .strict();

export const monthLockSchema = z
  .object({
    lockedAt: isoTime.nullable(),
    reopened: z.array(z.object({ at: isoTime, reason: z.string().min(1).max(500) }).strict()).max(50),
  })
  .strict();

export const vehicleSchema = z.object({ id: shortText.min(1), name: shortText, plate: z.string().max(20) }).strict();

/** PUT /api/logbook/months/:month. `baseRev` ist der Stand, auf dem der Client aufbaut (0 = neu). */
export const logbookMonthInputSchema = z
  .object({
    baseRev: z.number().int().min(0),
    trips: z.array(tripSchema).max(MAX_TRIPS_PER_MONTH),
    lock: monthLockSchema.nullable(),
  })
  .strict();

/** PUT /api/logbook/profile */
export const logbookProfileInputSchema = z
  .object({
    baseRev: z.number().int().min(0),
    vehicles: z.array(vehicleSchema).min(1).max(MAX_VEHICLES),
    activeVehicleId: shortText,
    importedV1: z.boolean(),
  })
  .strict();

export const logbookMonthParamsSchema = z.object({ month: monthKeySchema }).strict();

/** GET /api/logbook?since=…: nur Monate, die sich danach geändert haben. */
export const logbookQuerySchema = z.object({ since: z.iso.datetime().optional() }).strict();

export type LogbookTripFieldsDto = z.infer<typeof tripFieldsSchema>;
export type LogbookTripDto = z.infer<typeof tripSchema>;
export type LogbookLockDto = z.infer<typeof monthLockSchema>;
export type LogbookVehicleDto = z.infer<typeof vehicleSchema>;
export type LogbookMonthInput = z.infer<typeof logbookMonthInputSchema>;
export type LogbookProfileInput = z.infer<typeof logbookProfileInputSchema>;

export interface LogbookMonthView {
  month: string;
  rev: number;
  trips: LogbookTripDto[];
  lock: LogbookLockDto | null;
  updatedAt: string;
}

export interface LogbookProfileView {
  rev: number;
  vehicles: LogbookVehicleDto[];
  activeVehicleId: string;
  importedV1: boolean;
  updatedAt: string | null;
}

export interface LogbookView {
  profile: LogbookProfileView;
  months: LogbookMonthView[];
  /** Serverzeit der Antwort; der Client schickt sie beim nächsten Abgleich als `since`. */
  syncedAt: string;
}
