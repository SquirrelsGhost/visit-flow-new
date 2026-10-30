import { parseNote, statusOf } from "../crm/crmLogic";
import { localDay } from "../overview/todayStats";
import { onStreet } from "../streets/streetMatch";
import type { AdminSale, CustomerGroup, DateRange, OverviewFilter, OverviewStats, RangeId, SaleIssue, SalesPerson } from "./overviewTypes";
import { ALL_USERS } from "./overviewTypes";

/** Rohdaten aus v1 GET /products/admin/all und /doors/admin/all. */
export type RawRecord = Record<string, unknown>;

const text = (value: unknown) => (typeof value === "string" ? value.trim() : typeof value === "number" ? String(value) : "");
const num = (value: unknown) => (typeof value === "number" && Number.isFinite(value) ? value : undefined);
const UNKNOWN = "Unbekannt";

/** Tür-Id wie in v1: eigenes Feld `id`, sonst die Mongo-Id. */
export const doorKey = (door: RawRecord) => text(door.id) || text(door._id);

function issueOf(name: string, street: string): SaleIssue | undefined {
  if (!name || name === UNKNOWN) return "no_name";
  return street ? undefined : "no_address";
}

function upsellOf(p: RawRecord) {
  const upsell = { grade: num(p.upsellGrade), oldPrice: num(p.upsellOldPrice), newPrice: num(p.upsellNewPrice), diff: num(p.upsellDiff) };
  return Object.values(upsell).some((v) => v !== undefined) ? upsell : undefined;
}

/** Verkäufe mit Kunde und Adresse der Tür anreichern und Auffälligkeiten erkennen (v1 enrichSales). */
export function enrichSales(products: readonly RawRecord[], doors: readonly RawRecord[]): AdminSale[] {
  const byId = new Map(doors.map((d) => [doorKey(d), d]));
  return products.map((p) => {
    const door = byId.get(text(p.doorId)) ?? {};
    const name = text(door.name);
    const street = text(door.street);
    const address = [street, text(door.houseNumber)].filter(Boolean).join(" ");
    const place = [text(door.zipCode), text(door.city)].filter(Boolean).join(" ");
    const notes = text(p.notes);
    return {
      id: text(p.id) || text(p._id),
      doorId: text(p.doorId),
      userId: text(p.userId),
      userName: text(p.userName) || UNKNOWN,
      customerName: name || UNKNOWN,
      address: [address, place].filter(Boolean).join(", "),
      category: text(p.category),
      type: text(p.type) || text(p.category) || UNKNOWN,
      quantity: num(p.quantity) ?? 1,
      commissionEuro: num(p.commissionEuro) ?? 0,
      timestamp: text(p.createdAt) || text(p.timestamp),
      status: statusOf(notes),
      note: parseNote(notes).note,
      issue: issueOf(name, street),
      upsell: upsellOf(p),
    };
  });
}

const pad = (n: number) => String(n).padStart(2, "0");
const dayOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Grenzen eines Schnellfilters; "custom" behält die eingegebenen Tage. */
export function rangeFor(id: RangeId, now = new Date(), current?: DateRange): DateRange {
  const today = dayOf(now);
  if (id === "today") return { id, from: today, to: today };
  if (id === "week") return { id, from: dayOf(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)), to: today };
  if (id === "month") return { id, from: `${today.slice(0, 8)}01`, to: today };
  if (id === "all") return { id, from: "", to: "" };
  return { id, from: current?.from || today, to: current?.to || today };
}

export function inRange(timestamp: string, range: DateRange): boolean {
  if (!range.from && !range.to) return true;
  if (!timestamp) return false;
  const day = localDay(timestamp);
  return (!range.from || day >= range.from) && (!range.to || day <= range.to);
}

/** Alle Filter außer der Sortierung, wie v1 filteredSales; neueste zuerst. */
export function filterSales(sales: readonly AdminSale[], filter: OverviewFilter): AdminSale[] {
  const q = filter.query.trim().toLowerCase();
  return sales
    .filter((s) => inRange(s.timestamp, filter.range))
    .filter((s) => filter.userId === ALL_USERS || s.userId === filter.userId)
    .filter((s) => !filter.onlyIssues || s.issue !== undefined)
    .filter((s) => onStreet(s.address, filter.street))
    .filter((s) => !q || [s.customerName, s.userName, s.address, s.type].some((v) => v.toLowerCase().includes(q)))
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

/** Verkäufe je Tür bündeln und sortieren (v1 groupedSales). */
export function groupByCustomer(sales: readonly AdminSale[], sort: OverviewFilter["sort"]): CustomerGroup[] {
  const groups = new Map<string, CustomerGroup>();
  for (const s of sales) {
    const key = s.doorId || s.id;
    const g = groups.get(key) ?? { doorId: key, customerName: s.customerName, address: s.address, issue: s.issue, sales: [], total: 0, latest: s.timestamp, userId: s.userId, userName: s.userName };
    g.sales.push(s);
    if (s.status !== "cancelled") g.total += s.commissionEuro;
    if (s.timestamp > g.latest) Object.assign(g, { latest: s.timestamp, userId: s.userId, userName: s.userName });
    groups.set(key, g);
  }
  const list = [...groups.values()];
  if (sort === "commission") return list.sort((a, b) => b.total - a.total);
  if (sort === "name") return list.sort((a, b) => a.customerName.localeCompare(b.customerName, "de"));
  return list.sort((a, b) => b.latest.localeCompare(a.latest));
}

/** Kennzahlen der gefilterten Verkäufe; Stornos zählen nicht zur Provision. */
export function overviewStats(sales: readonly AdminSale[]): OverviewStats {
  return {
    sales: sales.length,
    customers: new Set(sales.map((s) => s.doorId || s.id)).size,
    issues: sales.filter((s) => s.issue).length,
    stornos: sales.filter((s) => s.status === "cancelled").length,
    commission: sales.reduce((sum, s) => sum + (s.status === "cancelled" ? 0 : s.commissionEuro), 0),
    activeUsers: new Set(sales.map((s) => s.userId)).size,
  };
}

/** Verkäufer für die Auswahl, alphabetisch, mit Anzahl ihrer Verkäufe. */
export function salesPeople(sales: readonly AdminSale[]): SalesPerson[] {
  const people = new Map<string, SalesPerson>();
  for (const s of sales) {
    const p = people.get(s.userId) ?? { id: s.userId, name: s.userName, count: 0 };
    p.count += 1;
    people.set(s.userId, p);
  }
  return [...people.values()].sort((a, b) => a.name.localeCompare(b.name, "de"));
}
