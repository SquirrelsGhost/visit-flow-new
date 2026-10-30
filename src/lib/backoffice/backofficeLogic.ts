import { groupOrders, monthCounts, verticalOf } from "../crm/crmLogic";
import type { OrderStatus, SaleRecord } from "../crm/crmTypes";
import { inRange } from "../crmOverview/overviewLogic";
import { ALL_USERS, type AdminSale } from "../crmOverview/overviewTypes";
import { onStreet } from "../streets/streetMatch";
import type { AddressView } from "./backofficeConfig";
import type { BackofficeFilter, BackofficeStats, SellerSummary, StatusTab } from "./backofficeTypes";

const MARK: Record<OrderStatus, string> = { open: "", completed: "[ABGESCHLOSSEN]", cancelled: "[STORNIERT]" };

/** Zurück in die Form der Seite Aufträge, damit die Stornoquote genau gleich zählt (je Tür und Tag). */
const asRecord = (s: AdminSale): SaleRecord => ({ ...s, notes: MARK[s.status] });

/** Stornoquote des laufenden Monats wie auf /crm und im Admin-Dashboard; null ohne Aufträge. */
export const monthQuote = (sales: readonly AdminSale[], now = new Date()) => monthCounts(groupOrders(sales.map(asRecord), now.getTime()), now).quote;

/** Leads (Solar) entscheidet Pipedrive, wie auf der Seite Aufträge; das Backoffice zeigt sie nur an. */
export const isDecidable = (s: AdminSale) => verticalOf(s.category) !== "solar";

/** Alle Filter außer dem Status-Reiter; daraus zählen die Reiter ihre Zahlen. */
export function filterBase(sales: readonly AdminSale[], filter: Omit<BackofficeFilter, "status">): AdminSale[] {
  const q = filter.query.trim().toLowerCase();
  return sales
    .filter((s) => inRange(s.timestamp, filter.range))
    .filter((s) => filter.userId === ALL_USERS || s.userId === filter.userId)
    .filter((s) => onStreet(s.address, filter.street))
    .filter((s) => !q || [s.customerName, s.userName, s.address, s.type].some((v) => v.toLowerCase().includes(q)));
}

export const byStatus = (sales: readonly AdminSale[], status: StatusTab) => (status === "all" ? [...sales] : sales.filter((s) => s.status === status));

export function statusCounts(sales: readonly AdminSale[]): Record<StatusTab, number> {
  const count = (status: OrderStatus) => sales.filter((s) => s.status === status).length;
  return { open: count("open"), completed: count("completed"), cancelled: count("cancelled"), all: sales.length };
}

export function backofficeStats(sales: readonly AdminSale[], now = new Date()): BackofficeStats {
  const counts = statusCounts(sales);
  const openCommission = sales.reduce((sum, s) => sum + (s.status === "open" ? s.commissionEuro : 0), 0);
  return { open: counts.open, completed: counts.completed, cancelled: counts.cancelled, openCommission, quote: monthQuote(sales, now) };
}

/** Verkäufer mit offenen Verkäufen zuerst, dann alphabetisch; Quote = Stornos im Monat je Auftrag. */
export function sellerSummaries(sales: readonly AdminSale[], now = new Date()): SellerSummary[] {
  const bySeller = new Map<string, AdminSale[]>();
  for (const s of sales) bySeller.set(s.userId, [...(bySeller.get(s.userId) ?? []), s]);
  return [...bySeller.values()]
    .map((list) => {
      const c = statusCounts(list);
      return { id: list[0]!.userId, name: list[0]!.userName, open: c.open, completed: c.completed, cancelled: c.cancelled, quote: monthQuote(list, now) };
    })
    .sort((a, b) => b.open - a.open || a.name.localeCompare(b.name, "de"));
}

/** Status nach einer Entscheidung im Browser nachziehen, ohne neu zu laden. */
export function applyStatus(sales: readonly AdminSale[], ids: ReadonlySet<string>, status: OrderStatus, reason?: string): AdminSale[] {
  return sales.map((s) => (ids.has(s.id) ? { ...s, status, note: status === "cancelled" && reason ? `Verlustgrund: ${reason}` : s.note } : s));
}

/** Nur die Verkäufe, über die ein Teamleiter entscheiden darf, und nur die, die den Status wirklich ändern. */
export const actionable = (sales: readonly AdminSale[], status?: OrderStatus) => sales.filter((s) => isDecidable(s) && (status === undefined || s.status !== status));

/** Adresse je nach Datenschutz-Einstellung (siehe BACKOFFICE_ADDRESS_VIEW). */
export function visibleAddress(address: string, view: AddressView): string {
  if (view === "none") return "";
  if (view === "full" || !address) return address;
  const [street = "", place = ""] = address.split(", ");
  const city = place.replace(/^\d{4,5}\s*/, "");
  return [street.replace(/\s+\d+\s*[a-zA-Z]?$/, ""), city].filter(Boolean).join(", ");
}

/** Beginn des Ladezeitraums: Monatserster vor `monthsBack` Monaten. */
export const loadStart = (now: Date, monthsBack: number) => new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
