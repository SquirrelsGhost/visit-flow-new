import { localDay } from "../overview/todayStats";
import type { RawDoor, RawProduct, StreetDateFilter, StreetPerson } from "./streetTypes";

export type ActivityPeriod = "week" | "month" | "custom";

/** Kategorien der v1-Aufschlüsselung (KIP, KAS, GigaTV …) mit Kurznamen. */
export const ACTIVITY_CATEGORIES: readonly [category: string, short: string][] = [
  ["KIP", "KIP"],
  ["KAS", "KAS"],
  ["GigaTV", "Giga"],
  ["Glasfaser", "Glas"],
  ["Upsell", "Upsell"],
  ["Mobile", "Mobile"],
  ["Zubehör", "Zub."],
];

export interface PersonActivity {
  person: StreetPerson;
  days: number;
  doors: number;
  sales: number;
  revenue: number;
  /** Verkäufe je Kategorie (nur die aus ACTIVITY_CATEGORIES). */
  breakdown: { short: string; count: number }[];
}

const startOfDay = (d: Date, shift = 0) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + shift);

/** Woche ab Montag oder Kalendermonat um das Bezugsdatum, als Datumsfilter (v1 AllUsersActivityTab dateRange). */
export function periodFilter(period: Exclude<ActivityPeriod, "custom">, anchor: Date): StreetDateFilter {
  if (period === "week") {
    const from = startOfDay(anchor, -((anchor.getDay() + 6) % 7));
    return { mode: "range", from: localDay(from), to: localDay(startOfDay(from, 6)) };
  }
  return { mode: "range", from: localDay(new Date(anchor.getFullYear(), anchor.getMonth(), 1)), to: localDay(new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0)) };
}

/** Bezugsdatum eine Woche bzw. einen Monat weiter (step = ±1). */
export function shiftAnchor(period: Exclude<ActivityPeriod, "custom">, anchor: Date, step: number): Date {
  return period === "week" ? startOfDay(anchor, 7 * step) : new Date(anchor.getFullYear(), anchor.getMonth() + step, 1);
}

/** ISO-Kalenderwoche (v1 format 'I'). */
export function isoWeek(date: Date): { week: number; year: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return { week: Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7), year: d.getUTCFullYear() };
}

const inFilter = (iso: string, filter: StreetDateFilter) => {
  if (filter.mode === "all") return true;
  if (!iso) return false;
  const day = localDay(iso);
  return day >= filter.from && day <= filter.to;
};

/**
 * Aktivität je Person wie v1: Tage mit mindestens einer Tür, Türen, Verkäufe (jeder Produkt-Eintrag zählt),
 * Umsatz aus der gespeicherten Provision. Alle Personen der Sicht erscheinen, sortiert nach Tagen.
 */
export function computeActivity(people: readonly StreetPerson[], doors: readonly RawDoor[], products: readonly RawProduct[], filter: StreetDateFilter): PersonActivity[] {
  const rows = new Map(people.map((p) => [p.id, { person: p, days: new Set<string>(), doors: 0, sales: 0, revenue: 0, cats: new Map<string, number>() }]));
  for (const door of doors) {
    const row = rows.get(door.userId);
    if (!row || !inFilter(door.timestamp, filter)) continue;
    row.doors += 1;
    row.days.add(localDay(door.timestamp));
  }
  for (const p of products) {
    const row = rows.get(p.userId);
    if (!row || !inFilter(p.timestamp, filter)) continue;
    row.sales += 1;
    row.revenue += p.commissionEuro * (p.quantity ?? 1);
    row.cats.set(p.category, (row.cats.get(p.category) ?? 0) + 1);
  }
  return [...rows.values()]
    .map((r) => ({
      person: r.person,
      days: r.days.size,
      doors: r.doors,
      sales: r.sales,
      revenue: r.revenue,
      breakdown: ACTIVITY_CATEGORIES.map(([cat, short]) => ({ short, count: r.cats.get(cat) ?? 0 })).filter((b) => b.count > 0),
    }))
    .sort((a, b) => b.days - a.days || b.sales - a.sales || a.person.name.localeCompare(b.person.name, "de-DE"));
}
