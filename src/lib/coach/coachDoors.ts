import type { Vertical } from "../battle/battleCategories";
import type { MapHouse, VisitStatus } from "../map/mapTypes";
import type { CoachDoor } from "./coachTypes";

/** So weit schaut der Coach zurück. */
export const COACH_DAYS = 28;
const DAY_MS = 86_400_000;

function toDoor(at: number, status: VisitStatus, street: string, categories: string[]): CoachDoor {
  return {
    at,
    notMet: status === "N/A",
    sold: categories.length > 0 || status === "Angetroffen → Sale",
    appointment: status === "Angetroffen → Termin",
    noInterest: status === "Angetroffen → Kein Interesse",
    supplied: status === "Angetroffen → Versorgt",
    street,
    categories,
  };
}

/**
 * Eigene Türen der letzten 28 Tage aus den Kartenhäusern (wie die Übersicht: Teamhäuser zählen nicht,
 * ein Haus ohne Türen zählt als eine Tür). Produkte nur der aktiven Sparte.
 */
export function coachDoors(houses: readonly MapHouse[], vertical: Vertical, now: number): CoachDoor[] {
  const since = now - COACH_DAYS * DAY_MS;
  const result: CoachDoor[] = [];
  for (const house of houses) {
    if (house.isTeam) continue;
    if (house.doors.length === 0) {
      if (house.status !== "offen" && house.updatedAt && house.updatedAt >= since) result.push(toDoor(house.updatedAt, house.status, house.street, []));
      continue;
    }
    for (const door of house.doors) {
      const at = new Date(door.timestamp).getTime();
      if (!Number.isFinite(at) || at < since || at > now) continue;
      const categories = (door.products ?? []).filter((p) => (p.vertical ?? "telco") === vertical).map((p) => p.category);
      result.push(toDoor(at, door.status, house.street, categories));
    }
  }
  return result.sort((a, b) => a.at - b.at);
}
