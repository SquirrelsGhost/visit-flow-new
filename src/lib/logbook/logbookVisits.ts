import { hasDemoSession } from "../auth/demoSession";
import { readStoredHouses } from "../map/mapStorage";
import type { MapHouse } from "../map/mapTypes";
import { isoDay } from "./logbookDates";

/** Vorschlag fürs Reiseziel aus den Besuchen eines Tages auf der Karte. */
export interface VisitSuggestion {
  /** "Köln-Ehrenfeld: Venloer Str., Glasstr." */
  to: string;
  doors: number;
  sales: number;
  streets: number;
}

const MAX_STREETS = 3;
const isSale = (status: string) => status === "Angetroffen → Sale" || status === "Approved";

/**
 * Fasst die an einem Tag erfassten Türen nach Ort und Straße zusammen. Kundennamen bleiben bewusst
 * draußen: fürs Fahrtenbuch reichen Gebiet und Zahl der Haushalte (Datensparsamkeit, DSGVO).
 */
export function visitSuggestion(houses: readonly MapHouse[], date: string): VisitSuggestion | null {
  const streetsByCity = new Map<string, Map<string, number>>();
  let doors = 0;
  let sales = 0;
  for (const house of houses) {
    const today = house.doors.filter((d) => d.timestamp && isoDay(new Date(d.timestamp)) === date);
    if (today.length === 0) continue;
    doors += today.length;
    sales += today.filter((d) => isSale(d.status)).length;
    const city = house.city.trim() || "?";
    const streets = streetsByCity.get(city) ?? new Map<string, number>();
    streets.set(house.street, (streets.get(house.street) ?? 0) + today.length);
    streetsByCity.set(city, streets);
  }
  if (doors === 0) return null;
  const cities = [...streetsByCity.entries()].sort((a, b) => sum(b[1]) - sum(a[1]));
  const to = cities
    .map(([city, streets]) => {
      const names = [...streets.entries()].sort((a, b) => b[1] - a[1]).map(([s]) => s);
      const shown = names.slice(0, MAX_STREETS).join(", ") + (names.length > MAX_STREETS ? ` +${names.length - MAX_STREETS}` : "");
      return `${city}: ${shown}`;
    })
    .join(" · ");
  return { to, doors, sales, streets: cities.reduce((n, [, s]) => n + s.size, 0) };
}

const sum = (m: Map<string, number>) => [...m.values()].reduce((a, b) => a + b, 0);

const DEMO_SUGGESTION: VisitSuggestion = { to: "Köln-Ehrenfeld: Venloer Str., Subbelrather Str., Glasstr.", doors: 38, sales: 3, streets: 3 };

/** Vorschlag für einen Tag aus dem Kartenspeicher dieses Geräts; die Demo hat einen festen Beispieltag (heute). */
export function suggestionFor(date: string, now = new Date()): VisitSuggestion | null {
  const found = visitSuggestion(readStoredHouses(), date);
  if (found || !hasDemoSession()) return found;
  return date === isoDay(now) ? DEMO_SUGGESTION : null;
}
