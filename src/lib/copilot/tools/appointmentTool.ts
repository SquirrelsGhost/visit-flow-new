import { readStoredHouses, writeStoredHouses } from "../../map/mapStorage";
import type { MapHouse } from "../../map/mapTypes";
import { pushHouseToServer } from "../../map/visitSync";
import { applyHouseStatus } from "../../../hooks/useMapHouses";
import { normalize } from "../copilotMatch";
import { HOUSES_CHANGED_EVENT } from "./copilotEvents";
import { str, type ToolArgs, type ToolContext } from "./copilotToolTypes";

const STATUS = "Angetroffen → Termin" as const;
/** Ohne Adresse in der Nachricht gilt die zuletzt besuchte Tür, wenn sie höchstens so alt ist. */
const RECENT_MS = 3 * 60 * 60 * 1000;

const streetKey = (street: string) => normalize(street).replace(/\s*(strasse|str)\.?$/, "");
const escape = (text: string) => text.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Tür zum Termin: zuerst Straße und Hausnummer aus der Nachricht (nur auf dem Gerät gelesen), sonst die
 * zuletzt besuchte eigene Tür der letzten drei Stunden. Nichts gefunden: null.
 */
export function findAppointmentHouse(ctx: ToolContext): MapHouse | null {
  const houses = readStoredHouses().filter((h) => !h.isTeam);
  const text = ` ${normalize(ctx.message)} `;
  const named = houses.filter((h) => {
    const key = streetKey(h.street);
    return key.length >= 3 && text.includes(key) && new RegExp(`\\b${escape(h.houseNumber)}\\b`).test(text);
  });
  if (named.length > 0) return named.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))[0] ?? null;
  const recent = houses.filter((h) => (h.updatedAt ?? 0) >= ctx.now - RECENT_MS).sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
  return recent[0] ?? null;
}

export const addressOf = (house: MapHouse) => `${house.street} ${house.houseNumber}`.trim();

/** Termin an die Tür schreiben, lokal sofort und danach am Server (wie die Karte). */
export async function saveAppointment(houseId: string, args: ToolArgs): Promise<boolean> {
  const houses = readStoredHouses();
  const house = houses.find((h) => h.id === houseId);
  if (!house) return false;
  const note = str(args, "note");
  // MFH: die zuletzt besuchte Partei, EFH: das ganze Haus (wie applyHouseStatus)
  const unit = house.type === "MFH" ? ([...house.doors].sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0]?.name ?? null) : null;
  const updated = applyHouseStatus(house, STATUS, unit, note);
  const withDate: MapHouse = {
    ...updated,
    doors: updated.doors.map((d) => (d.status === STATUS && (!unit || d.name === unit) ? { ...d, appointmentDate: str(args, "date"), appointmentTime: str(args, "time") } : d)),
  };
  writeStoredHouses(houses.map((h) => (h.id === houseId ? withDate : h)));
  window.dispatchEvent(new Event(HOUSES_CHANGED_EVENT));
  const synced = await pushHouseToServer(withDate);
  writeStoredHouses(readStoredHouses().map((h) => (h.id === houseId ? synced : h)));
  window.dispatchEvent(new Event(HOUSES_CHANGED_EVENT));
  return true;
}
