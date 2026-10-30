import type { Vertical } from "../battle/battleCategories";
import type { DoorProduct, MapHouse, VisitStatus } from "../map/mapTypes";
import type { ProductCategory } from "../map/productMeta";
import { productGroupsFor } from "./productGroups";

/** Tageszahlen der Übersicht, gezählt wie in v1 DailyView. */
export interface TodayStats {
  doors: number;
  /** Türen mit mindestens einem Produkt (v1: "Angetroffen → Sale" über Produkte). */
  saleDoors: number;
  /** Anzahl der verkauften Produkte. */
  products: number;
  appointments: number;
  noInterest: number;
  supplied: number;
  met: number;
  notMet: number;
  /** Angetroffen je Tür in Prozent (v1 Antrefferquote). */
  hitRate: number;
  /** Abschlüsse je angetroffener Tür in Prozent (v1 Verkaufsquote). */
  salesRate: number;
  /** Produkte je Gruppe der Sparte, in fester Reihenfolge. */
  groups: { category: ProductCategory; count: number }[];
  /** Zeitpunkt der ersten und letzten Tür heute (ms). */
  firstAt?: number;
  lastAt?: number;
}

interface CountedDoor {
  id: string;
  status: VisitStatus;
  products: DoorProduct[];
  at: number;
}

/** Lokales Datum JJJJ-MM-TT, wie v1 getLocalDateString. */
export function localDay(value: string | number | Date): string {
  const d = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Alle heute erfassten Türen. Ein Haus ohne eigene Türen zählt als eine Tür mit seinem Status. */
function todayDoors(houses: readonly MapHouse[], today: string): CountedDoor[] {
  const result: CountedDoor[] = [];
  for (const house of houses) {
    if (house.isTeam) continue;
    if (house.doors.length === 0) {
      if (house.status !== "offen" && house.updatedAt && localDay(house.updatedAt) === today) {
        result.push({ id: house.id, status: house.status, products: [], at: house.updatedAt });
      }
      continue;
    }
    for (const door of house.doors) {
      if (door.timestamp && localDay(door.timestamp) === today) {
        result.push({ id: door.id, status: door.status, products: door.products ?? [], at: new Date(door.timestamp).getTime() });
      }
    }
  }
  return result;
}

const percent = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 100) : 0);

/** Rechnet die Tageszahlen aus den gespeicherten Häusern; Produkte zählen nur in der aktiven Sparte. */
export function computeTodayStats(houses: readonly MapHouse[], vertical: Vertical, now: Date = new Date()): TodayStats {
  const today = localDay(now);
  const doors = todayDoors(houses, today);
  const products = doors.flatMap((door) =>
    door.products.filter((p) => (p.vertical ?? "telco") === vertical && localDay(p.timestamp || now) === today).map((p) => ({ ...p, doorId: door.id })),
  );
  const count = (status: VisitStatus) => doors.filter((d) => d.status === status).length;
  const saleDoors = new Set(products.map((p) => p.doorId)).size;
  const appointments = count("Angetroffen → Termin");
  const noInterest = count("Angetroffen → Kein Interesse");
  const supplied = count("Angetroffen → Versorgt");
  const met = appointments + saleDoors + supplied + noInterest;
  const groups = productGroupsFor(vertical).map((category) => ({
    category,
    count: products.filter((p) => p.category === category).reduce((sum, p) => sum + Math.max(1, p.quantity ?? 1), 0),
  }));
  return {
    doors: doors.length,
    saleDoors,
    products: products.length,
    appointments,
    noInterest,
    supplied,
    met,
    notMet: count("N/A"),
    hitRate: percent(met, doors.length),
    salesRate: percent(saleDoors, met),
    groups,
    firstAt: doors.length > 0 ? Math.min(...doors.map((d) => d.at)) : undefined,
    lastAt: doors.length > 0 ? Math.max(...doors.map((d) => d.at)) : undefined,
  };
}
