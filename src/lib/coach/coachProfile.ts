import type { Vertical } from "../battle/battleCategories";
import type { MapHouse } from "../map/mapTypes";
import { localDay } from "../overview/todayStats";
import { coachDoors } from "./coachDoors";
import type { CoachDoor, CoachProfile, CoachStreet, CoachWeakSpot, CoachWindow } from "./coachTypes";

/** Unter so vielen Türen sagt der Coach nur "ich lerne dich noch kennen". */
export const MIN_DOORS = 20;
/** Ein Zeitfenster zählt erst ab so vielen Türen. */
const MIN_WINDOW_DOORS = 8;
const WINDOW_HOURS = 2;
const DAY_MS = 86_400_000;
const MAX_STREETS = 3;

const pct = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 100) : 0);
const isMet = (d: CoachDoor) => !d.notMet;

/** Bestes Zwei-Stunden-Fenster nach Antrefferquote, nur wenn es klar über dem Schnitt liegt. */
export function bestWindow(doors: readonly CoachDoor[]): CoachWindow | null {
  const buckets = new Map<number, { all: number; met: number }>();
  for (const door of doors) {
    const start = Math.floor(new Date(door.at).getHours() / WINDOW_HOURS) * WINDOW_HOURS;
    const bucket = buckets.get(start) ?? { all: 0, met: 0 };
    bucket.all += 1;
    if (isMet(door)) bucket.met += 1;
    buckets.set(start, bucket);
  }
  const averageRate = pct(doors.filter(isMet).length, doors.length);
  let best: CoachWindow | null = null;
  for (const [fromHour, { all, met }] of buckets) {
    if (all < MIN_WINDOW_DOORS) continue;
    const hitRate = pct(met, all);
    if (!best || hitRate > best.hitRate) best = { fromHour, toHour: fromHour + WINDOW_HOURS, hitRate, averageRate };
  }
  return best && best.hitRate >= averageRate + 5 ? best : null;
}

/**
 * Größte Schwachstelle: zu oft niemand da, zu oft "kein Interesse", zu oft "versorgt",
 * oder viele Gespräche ohne Abschluss. Schwellen aus typischen D2D-Quoten.
 */
export function weakSpotOf(doors: readonly CoachDoor[]): CoachWeakSpot {
  const met = doors.filter(isMet);
  if (doors.length < MIN_DOORS) return null;
  if (pct(doors.length - met.length, doors.length) >= 55) return "notMet";
  const noInterest = pct(met.filter((d) => d.noInterest).length, met.length);
  const supplied = pct(met.filter((d) => d.supplied).length, met.length);
  if (noInterest >= 45 && noInterest >= supplied) return "noInterest";
  if (supplied >= 35) return "supplied";
  return pct(met.filter((d) => d.sold).length, met.length) < 10 ? "closing" : null;
}

function categoryMix(doors: readonly CoachDoor[]): { top: string | null; rare: string | null } {
  const counts = new Map<string, number>();
  for (const door of doors) for (const c of door.categories) counts.set(c, (counts.get(c) ?? 0) + 1);
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const top = sorted[0];
  const last = sorted[sorted.length - 1];
  const rare = top && last && sorted.length > 1 && last[1] * 5 <= top[1] ? last[0] : null;
  return { top: top?.[0] ?? null, rare };
}

/** Straßen mit den meisten offenen Chancen (nicht angetroffen, Termin, versorgt) für die Route von heute. */
function openStreets(doors: readonly CoachDoor[]): CoachStreet[] {
  const counts = new Map<string, number>();
  for (const d of doors) if (d.street && (d.notMet || d.appointment || d.supplied)) counts.set(d.street, (counts.get(d.street) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, MAX_STREETS).map(([street, open]) => ({ street, open }));
}

function streak(doors: readonly CoachDoor[], now: number): number {
  const days = new Set(doors.map((d) => localDay(d.at)));
  let count = 0;
  // Heute ohne Tür bricht die Serie nicht, der Tag läuft noch
  const startOffset = days.has(localDay(now)) ? 0 : 1;
  while (days.has(localDay(now - (count + startOffset) * DAY_MS))) count += 1;
  return count;
}

const soldBetween = (doors: readonly CoachDoor[], from: number, to: number) => doors.filter((d) => d.sold && d.at >= from && d.at < to).length;

/** Coach-Profil aus den Kartenhäusern; rein lokal, ohne Server. */
export function buildCoachProfile(houses: readonly MapHouse[], vertical: Vertical, now: number = Date.now()): CoachProfile {
  const doors = coachDoors(houses, vertical, now);
  const met = doors.filter(isMet);
  const sales = doors.filter((d) => d.sold).length;
  const today = localDay(now);
  const todays = doors.filter((d) => localDay(d.at) === today);
  const mix = categoryMix(doors);
  return {
    doors: doors.length,
    met: met.length,
    sales,
    hitRate: pct(met.length, doors.length),
    salesRate: pct(sales, met.length),
    salesTrend: soldBetween(doors, now - 7 * DAY_MS, now + 1) - soldBetween(doors, now - 14 * DAY_MS, now - 7 * DAY_MS),
    bestWindow: bestWindow(doors),
    weakSpot: weakSpotOf(doors),
    topCategory: mix.top,
    rareCategory: mix.rare,
    streets: openStreets(doors),
    streakDays: streak(doors, now),
    today: { doors: todays.length, sales: todays.filter((d) => d.sold).length },
    learning: doors.length < MIN_DOORS,
  };
}
