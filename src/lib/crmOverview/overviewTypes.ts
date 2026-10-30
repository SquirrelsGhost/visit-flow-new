import type { OrderStatus } from "../crm/crmTypes";
import type { StreetRef } from "../streets/streetMatch";

/** Warum ein Verkauf auffällt (v1 issueType): Tür ohne Kundenname oder ohne Straße. */
export type SaleIssue = "no_name" | "no_address";

/** Upsell-Angaben eines Produkts (v1 upsellGrade/-OldPrice/-NewPrice/-Diff). */
export interface SaleUpsell {
  grade?: number;
  oldPrice?: number;
  newPrice?: number;
  diff?: number;
}

/** Ein verkauftes Produkt eines beliebigen Nutzers, angereichert mit Kunde und Adresse der Tür (v1 EnrichedSale). */
export interface AdminSale {
  id: string;
  doorId: string;
  userId: string;
  userName: string;
  customerName: string;
  address: string;
  category: string;
  type: string;
  quantity: number;
  commissionEuro: number;
  timestamp: string;
  status: OrderStatus;
  note?: string;
  issue?: SaleIssue;
  upsell?: SaleUpsell;
}

/** Alle Verkäufe einer Tür (v1 GroupedSale); Verkäufer und Datum vom jüngsten Verkauf. */
export interface CustomerGroup {
  doorId: string;
  customerName: string;
  address: string;
  issue?: SaleIssue;
  sales: AdminSale[];
  total: number;
  latest: string;
  userId: string;
  userName: string;
}

/** Zeitraum wie die Schnellfilter in v1 (Heute, Diese Woche, Dieser Monat), dazu Gesamt und eigener Zeitraum. */
export type RangeId = "today" | "week" | "month" | "all" | "custom";

export interface DateRange {
  id: RangeId;
  /** JJJJ-MM-TT; leer = offen. */
  from: string;
  to: string;
}

export type SortId = "date" | "commission" | "name";

export const ALL_USERS = "all";

export interface OverviewFilter {
  range: DateRange;
  userId: string;
  onlyIssues: boolean;
  query: string;
  sort: SortId;
  /** Straße aus der Straßenliste (?strasse=…); null = alle. */
  street?: StreetRef | null;
}

export interface OverviewStats {
  sales: number;
  customers: number;
  issues: number;
  stornos: number;
  commission: number;
  activeUsers: number;
}

export interface SalesPerson {
  id: string;
  name: string;
  count: number;
}
