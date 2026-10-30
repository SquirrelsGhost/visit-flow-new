import { normalizeStatus, productText } from "./streetStatus";
import type { RawProduct, StreetData, StreetDoor, StreetPlace, StreetProduct, StreetRow } from "./streetTypes";

const byHouse = (a: StreetDoor, b: StreetDoor) => a.houseNumber.localeCompare(b.houseNumber, "de-DE", { numeric: true });

/** Verkäufe je Tür, nach Kategorie zusammengezählt (v1 productsByCategory). */
function productsByDoor(products: readonly RawProduct[]): Map<string, StreetProduct[]> {
  const map = new Map<string, Map<string, number>>();
  for (const p of products) {
    if (!p.doorId || !p.category) continue;
    const cats = map.get(p.doorId) ?? new Map<string, number>();
    cats.set(p.category, (cats.get(p.category) ?? 0) + (p.quantity ?? 1));
    map.set(p.doorId, cats);
  }
  return new Map([...map].map(([id, cats]) => [id, [...cats].map(([category, quantity]) => ({ category, quantity }))]));
}

/**
 * Türen nach Straße bündeln wie v1 AdminStreetListContent: Schlüssel PLZ|ort|straße (klein), Türen ohne Hausnummer
 * fallen raus (die landen bei den Lösch-Anfragen), sortiert nach PLZ, Ort, Straße und Hausnummer.
 */
export function buildStreetRows({ doors, products }: StreetData, nameOf: (id: string) => string | undefined, unknown: string): StreetRow[] {
  const byDoor = productsByDoor(products);
  const rows = new Map<string, StreetRow>();
  for (const door of doors) {
    if (!door.houseNumber.trim()) continue;
    const key = [door.zipCode, door.city.toLowerCase(), door.street.toLowerCase()].join("|");
    const row = rows.get(key) ?? { key, zipCode: door.zipCode, city: door.city, street: door.street, doors: [], sales: 0, memberNames: [] };
    const status = normalizeStatus(door.status);
    const memberName = nameOf(door.userId) ?? door.userName ?? unknown;
    row.doors.push({ id: door.id, houseNumber: door.houseNumber, status, memberId: door.userId, memberName, customerName: door.customerName, timestamp: door.timestamp, products: byDoor.get(door.id) ?? [] });
    if (status === "sale") row.sales += 1;
    if (!row.memberNames.includes(memberName)) row.memberNames.push(memberName);
    rows.set(key, row);
  }
  return [...rows.values()]
    .map((row) => ({ ...row, doors: row.doors.sort(byHouse) }))
    .sort((a, b) => a.zipCode.localeCompare(b.zipCode) || a.city.localeCompare(b.city, "de-DE") || a.street.localeCompare(b.street, "de-DE"));
}

/** Suche wie v1: passt die Straße (PLZ, Ort, Name), bleiben alle Türen, sonst nur Türen mit passender Person oder Hausnummer. */
export function searchRows(rows: readonly StreetRow[], query: string): StreetRow[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...rows];
  return rows
    .map((row) => {
      const hit = [row.zipCode, row.city, row.street].some((v) => v.toLowerCase().includes(q));
      if (hit) return row;
      const doors = row.doors.filter((d) => d.memberName.toLowerCase().includes(q) || d.houseNumber.toLowerCase().includes(q) || d.customerName.toLowerCase().includes(q));
      return { ...row, doors, sales: doors.filter((d) => d.status === "sale").length };
    })
    .filter((row) => row.doors.length > 0);
}

/** Nur Türen bestimmter Personen (Strukturleiter-Gruppe, v1 selectedGroup). */
export function rowsOfPeople(rows: readonly StreetRow[], ids: ReadonlySet<string>): StreetRow[] {
  return rows
    .map((row) => {
      const doors = row.doors.filter((d) => ids.has(d.memberId));
      return { ...row, doors, sales: doors.filter((d) => d.status === "sale").length, memberNames: [...new Set(doors.map((d) => d.memberName))] };
    })
    .filter((row) => row.doors.length > 0);
}

export function groupByPlace(rows: readonly StreetRow[]): StreetPlace[] {
  const map = new Map<string, StreetRow[]>();
  for (const row of rows) {
    const key = `${row.zipCode} ${row.city}`.trim();
    map.set(key, [...(map.get(key) ?? []), row]);
  }
  return [...map].map(([key, list]) => ({ key, rows: list }));
}

/** Türen einer Straße nach Hausnummer; mehr als eine Tür = MFH (v1 doorsByHouseNumber). */
export function housesOf(row: StreetRow): { houseNumber: string; doors: StreetDoor[] }[] {
  const map = new Map<string, StreetDoor[]>();
  for (const door of row.doors) map.set(door.houseNumber, [...(map.get(door.houseNumber) ?? []), door]);
  return [...map].map(([houseNumber, doors]) => ({ houseNumber, doors }));
}

export interface StreetStats {
  doors: number;
  sales: number;
  places: number;
  doorsByPerson: { id: string; name: string; count: number }[];
  salesByPerson: { id: string; name: string; products: string }[];
  active: { id: string; name: string }[];
}

/** Kennzahlen und Detail-Listen der Kopfkarte (v1 stats: Türen, Sales, Aktiv mit Popovern). */
export function streetStats(rows: readonly StreetRow[]): StreetStats {
  const doors = new Map<string, { id: string; name: string; count: number }>();
  const sales = new Map<string, { id: string; name: string; products: string[]; count: number }>();
  for (const row of rows) {
    for (const door of row.doors) {
      const d = doors.get(door.memberId) ?? { id: door.memberId, name: door.memberName, count: 0 };
      d.count += 1;
      doors.set(door.memberId, d);
      if (door.status !== "sale") continue;
      const s = sales.get(door.memberId) ?? { id: door.memberId, name: door.memberName, products: [], count: 0 };
      s.count += 1;
      if (door.products.length > 0) s.products.push(productText(door.products));
      sales.set(door.memberId, s);
    }
  }
  const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name, "de-DE");
  return {
    doors: rows.reduce((sum, r) => sum + r.doors.length, 0),
    sales: rows.reduce((sum, r) => sum + r.sales, 0),
    places: new Set(rows.map((r) => `${r.zipCode} ${r.city}`)).size,
    doorsByPerson: [...doors.values()].sort((a, b) => b.count - a.count || byName(a, b)),
    salesByPerson: [...sales.values()].sort(byName).map(({ id, name, products }) => ({ id, name, products: products.join(", ") })),
    active: [...doors.values()].map(({ id, name }) => ({ id, name })).sort(byName),
  };
}
