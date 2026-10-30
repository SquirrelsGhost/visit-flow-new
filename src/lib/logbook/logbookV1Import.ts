import { z } from "zod";
import { createTrip } from "./logbookDraft";
import type { Trip } from "./logbookTypes";

/** Schlüssel des v1-Fahrtenbuchs (FahrtenbuchService.FAHRTENBUCH_HISTORY_KEY); v2 liest ihn nur. */
export const V1_HISTORY_KEY = "visit-flow-fahrtenbuch-history";

const stopSchema = z.object({
  customLocation: z.object({ name: z.string().optional(), fullAddress: z.string().optional() }).partial().optional(),
  purpose: z.string().optional(),
  businessPartner: z.string().optional(),
}).passthrough();

const daySchema = z.object({
  route: z.array(stopSchema).catch([]),
  totalDistance: z.number().catch(0),
  startKm: z.number().optional().catch(undefined),
  endKm: z.number().optional().catch(undefined),
  startTime: z.string().optional().catch(undefined),
  endTime: z.string().optional().catch(undefined),
  driver: z.string().optional().catch(undefined),
});

const unique = (values: (string | undefined)[], limit: number) => {
  const list = [...new Set(values.map((v) => v?.trim()).filter((v): v is string => Boolean(v) && v !== "Unbekannt"))];
  return list.length > limit ? `${list.slice(0, limit).join(", ")} +${list.length - limit}` : list.join(", ");
};

/** "📅 Termin 14:00" → "Termin 14:00": v1 schrieb Symbole in den Zweck. */
const cleanPurpose = (p: string) => p.replace(/[^\p{L}\p{N}\s:.,/-]/gu, "").trim();

export interface V1ImportResult {
  trips: Trip[];
  /** Tage ohne Kilometerstand (v1 speicherte 0, solange kein Stand erfasst war). */
  skipped: number;
}

/** Wandelt den v1-Verlauf (ein Eintrag je Tag mit allen Stopps) in je eine Dienstfahrt pro Tag. */
export function importV1History(raw: unknown, vehicleId: string, driver: string, now = new Date()): V1ImportResult {
  if (!raw || typeof raw !== "object") return { trips: [], skipped: 0 };
  const trips: Trip[] = [];
  let skipped = 0;
  for (const [date, value] of Object.entries(raw as Record<string, unknown>)) {
    const day = daySchema.safeParse(value);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !day.success || day.data.route.length === 0) continue;
    const d = day.data;
    const startKm = Math.round(d.startKm ?? 0);
    if (startKm <= 0) {
      skipped++;
      continue;
    }
    const endKm = Math.round(d.endKm ?? startKm + d.totalDistance);
    const purposes = d.route.map((s) => cleanPurpose(s.purpose ?? "")).filter(Boolean);
    const trip = createTrip(
      {
        date,
        startTime: d.startTime ?? "",
        endTime: d.endTime ?? "",
        startKm,
        endKm: Math.max(endKm, startKm + 1),
        kind: "business",
        from: "",
        to: unique(d.route.map((s) => s.customLocation?.fullAddress ?? s.customLocation?.name), 4),
        purpose: purposes[0] ?? "Kundenbesuch",
        partner: unique(d.route.map((s) => s.businessPartner ?? s.customLocation?.name), 4),
        detour: "",
        vehicleId,
      },
      d.driver || driver,
      "v1",
      now,
    );
    trips.push(trip);
  }
  return { trips, skipped };
}

export function readV1History(): unknown {
  try {
    const raw = window.localStorage.getItem(V1_HISTORY_KEY);
    return raw ? (JSON.parse(raw) as unknown) : null;
  } catch {
    return null;
  }
}
