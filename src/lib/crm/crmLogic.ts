import type { Vertical } from "../battle/battleCategories";
import { onStreet, type StreetRef } from "../streets/streetMatch";
import type { MonthCounts, Order, OrderFilter, OrderProduct, OrderStatus, SaleRecord } from "./crmTypes";

/** Telco: erst nach 14 Tagen abschließbar. Lead: Frist von 7 Tagen bis Pipedrive entscheidet (v1 CRM_CONSTANTS). */
export const DAYS_UNTIL_COMPLETION = 14;
export const LEAD_DAYS = 7;
/** Stornoquote, bis zu der der Telco-Bonus gilt (v1 Simulator). */
export const STORNO_LIMIT = 15;
export const STORNO_BONUS = 750;

const DAY = 24 * 60 * 60 * 1000;
const SOLAR = new Set(["Solar_PV", "Solar_Miete", "Speicher", "Waermepumpe", "Wallbox"]);
const ENERGY = new Set(["Strom", "Gas"]);

export function statusOf(notes?: string): OrderStatus {
  if (notes?.includes("[STORNIERT]")) return "cancelled";
  if (notes?.includes("[ABGESCHLOSSEN]")) return "completed";
  return "open";
}

/** Bereich eines Produkts aus seiner Kategorie; die v1-Antwort liefert kein eigenes Feld. */
export function verticalOf(category: string): Vertical {
  if (SOLAR.has(category) || category.startsWith("Solar")) return "solar";
  if (ENERGY.has(category)) return "energy";
  return "telco";
}

export const daysSince = (timestamp: string, now = Date.now()) => Math.max(0, Math.floor((now - new Date(timestamp).getTime()) / DAY));

/** Notiz ohne Statusmarken, Verlustgrund getrennt (v1 SaleCard). */
export function parseNote(notes = ""): { note?: string; lostReason?: string } {
  let text = notes.replace(/\[(ABGESCHLOSSEN|STORNIERT)\]/g, "").replace(/^\s*[;,\s]+/, "").trim();
  let lostReason: string | undefined;
  const match = text.match(/\(Verlustgrund:\s*(.*?)\)/) ?? text.match(/Verlustgrund:\s*(.*)/);
  if (match) {
    lostReason = match[1]?.trim() || undefined;
    text = text.replace(match[0], "").trim();
  }
  return { note: text || undefined, lostReason };
}

/** Ein Auftrag ist storniert, sobald ein Produkt storniert ist; abgeschlossen erst, wenn alle es sind. */
function orderStatus(products: readonly OrderProduct[]): OrderStatus {
  if (products.some((p) => p.status === "cancelled")) return "cancelled";
  return products.every((p) => p.status === "completed") ? "completed" : "open";
}

const localDay = (timestamp: string) => {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

/** Fasst Produkte je Tür und Tag zu Aufträgen zusammen, neueste zuerst (v1 CRMPage). */
export function groupOrders(sales: readonly SaleRecord[], now = Date.now()): Order[] {
  const map = new Map<string, { first: SaleRecord; products: OrderProduct[]; notes: string[] }>();
  for (const sale of sales) {
    const key = `${sale.doorId}_${localDay(sale.timestamp)}`;
    const entry = map.get(key) ?? { first: sale, products: [], notes: [] };
    entry.products.push({ id: sale.id, type: sale.type, category: sale.category, quantity: sale.quantity ?? 1, commissionEuro: sale.commissionEuro || 0, status: statusOf(sale.notes) });
    if (sale.notes && !entry.notes.includes(sale.notes)) entry.notes.push(sale.notes);
    if (new Date(sale.timestamp) < new Date(entry.first.timestamp)) entry.first = sale;
    map.set(key, entry);
  }
  const orders = [...map.entries()].map(([id, { first, products, notes }]): Order => {
    const status = orderStatus(products);
    return {
      id,
      doorId: first.doorId,
      customerName: first.customerName || "Unbekannt",
      customerType: first.customerType,
      address: first.address,
      timestamp: first.timestamp,
      daysSince: daysSince(first.timestamp, now),
      totalCommission: products.reduce((sum, p) => sum + p.commissionEuro, 0),
      products,
      status,
      ...parseNote(notes.join("; ")),
    };
  });
  return orders.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function sameMonth(timestamp: string, ref: Date): boolean {
  const d = new Date(timestamp);
  return d.getMonth() === ref.getMonth() && d.getFullYear() === ref.getFullYear();
}

/** Zahlen des Monats von `ref`. Quote = Stornos ÷ alle Aufträge des Monats. */
export function monthCounts(orders: readonly Order[], ref = new Date()): MonthCounts {
  const month = orders.filter((o) => sameMonth(o.timestamp, ref));
  const stornos = month.filter((o) => o.status === "cancelled").length;
  const completed = month.filter((o) => o.status === "completed").length;
  return {
    sales: month.length - stornos,
    stornos,
    open: month.length - stornos - completed,
    completed,
    quote: month.length > 0 ? (stornos / month.length) * 100 : null,
    commission: month.reduce((sum, o) => sum + (o.status === "cancelled" ? 0 : o.totalCommission), 0),
  };
}

/** Bonus hält, solange die Quote höchstens STORNO_LIMIT beträgt (ohne Aufträge: noch offen = hält). */
export const stornoOk = (quote: number | null) => quote === null || quote <= STORNO_LIMIT;

/** Wie viele Stornos noch gehen, bevor die Quote über das Limit rutscht. */
export function stornoBuffer(c: Pick<MonthCounts, "sales" | "stornos">): number {
  const total = c.sales + c.stornos;
  return Math.max(0, Math.floor((total * STORNO_LIMIT) / 100) - c.stornos);
}

/** Wie viele Sales ohne Storno nötig sind, bis die Quote wieder höchstens STORNO_LIMIT beträgt. */
export function salesToRecover(c: Pick<MonthCounts, "sales" | "stornos">): number {
  const total = c.sales + c.stornos;
  return Math.max(0, Math.ceil((c.stornos * 100) / STORNO_LIMIT - total));
}

/** Status, Suche und (aus der Straßenliste) die Straße. */
export function filterOrders(orders: readonly Order[], filter: OrderFilter, query: string, street: StreetRef | null = null): Order[] {
  const q = query.trim().toLowerCase();
  return orders.filter((o) => {
    if (filter !== "all" && o.status !== filter) return false;
    if (!onStreet(o.address, street)) return false;
    if (!q) return true;
    return [o.customerName, o.address, ...o.products.map((p) => p.type)].some((s) => s.toLowerCase().includes(q));
  });
}

/** Aktuell (unter der Frist) und älter, wie die zwei Listen in v1. */
export function splitByAge(orders: readonly Order[], vertical: Vertical): { recent: Order[]; older: Order[] } {
  const limit = vertical === "solar" ? LEAD_DAYS : DAYS_UNTIL_COMPLETION;
  return { recent: orders.filter((o) => o.daysSince < limit), older: orders.filter((o) => o.daysSince >= limit) };
}

export const ordersOfVertical = (sales: readonly SaleRecord[], vertical: Vertical) => sales.filter((s) => verticalOf(s.category) === vertical);

export const canComplete = (o: Order) => o.status === "open" && o.daysSince >= DAYS_UNTIL_COMPLETION;
/** Leads laufen über Pipedrive und werden nicht von Hand bearbeitet (v1). */
export const isEditable = (o: Order, vertical: Vertical) => vertical !== "solar" && o.status === "open";
