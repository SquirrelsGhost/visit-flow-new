import { z } from "zod";
import type { LogbookData } from "./logbookTypes";

const text = z.string().max(500).catch("");
const km = z.number().int().min(0).max(9_999_999);

const fields = {
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).catch(""),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).catch(""),
  startKm: km,
  endKm: km,
  kind: z.enum(["business", "private", "commute"]).catch("business"),
  from: text,
  to: text,
  purpose: text,
  partner: text,
  detour: text,
  vehicleId: z.string().catch(""),
};

const tripFieldsSchema = z.object(fields);

const tripSchema = z.object({
  ...fields,
  id: z.string().min(1),
  driver: text,
  source: z.enum(["manual", "v1", "gap"]).catch("manual"),
  createdAt: z.string(),
  updatedAt: z.string().optional().catch(undefined),
  revisions: z.array(z.object({ at: z.string(), before: tripFieldsSchema })).catch([]),
});

const lockSchema = z.object({
  lockedAt: z.string().nullable(),
  reopened: z.array(z.object({ at: z.string(), reason: z.string() })).catch([]),
});

/** Ein kaputter Eintrag fällt einzeln heraus, statt das ganze Fahrtenbuch zu verwerfen. */
const tolerantTrips = z.array(z.unknown()).transform((items) => items.flatMap((item) => {
  const parsed = tripSchema.safeParse(item);
  return parsed.success ? [parsed.data] : [];
}));

export const logbookSchema = z.object({
  version: z.literal(1).catch(1),
  vehicles: z.array(z.object({ id: z.string(), name: text, plate: text })).catch([]),
  activeVehicleId: z.string().catch(""),
  trips: tolerantTrips.catch([]),
  locks: z.record(z.string(), lockSchema).catch({}),
  importedV1: z.boolean().catch(false),
});

export const DEFAULT_VEHICLE_ID = "car-1";

/** Leeres Fahrtenbuch mit einem Fahrzeug, damit jede Fahrt ein Fahrzeug hat. */
export const emptyLogbook = (): LogbookData => ({
  version: 1,
  vehicles: [{ id: DEFAULT_VEHICLE_ID, name: "", plate: "" }],
  activeVehicleId: DEFAULT_VEHICLE_ID,
  trips: [],
  locks: {},
  importedV1: false,
});

export function parseLogbook(raw: unknown): LogbookData {
  const parsed = logbookSchema.safeParse(raw);
  if (!parsed.success) return emptyLogbook();
  const data = parsed.data;
  if (data.vehicles.length === 0) data.vehicles = emptyLogbook().vehicles;
  if (!data.vehicles.some((v) => v.id === data.activeVehicleId)) data.activeVehicleId = data.vehicles[0]!.id;
  return data;
}
