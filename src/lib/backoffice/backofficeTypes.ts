import type { OrderStatus } from "../crm/crmTypes";
import type { DateRange } from "../crmOverview/overviewTypes";
import type { StreetRef } from "../streets/streetMatch";

/** Wer die Seite wie sieht: Admin immer, Teamleiter mit oder ohne Add-on, alle anderen gar nicht. */
export type BackofficeAccess = "admin" | "active" | "locked" | "none";

/** Status-Reiter; "open" ist der Arbeitsstapel des Backoffice. */
export type StatusTab = OrderStatus | "all";

export interface BackofficeFilter {
  status: StatusTab;
  range: DateRange;
  userId: string;
  query: string;
  /** Straße aus der Straßenliste (?strasse=…); null = alle. */
  street?: StreetRef | null;
}

/** Entscheidung des Teamleiters über einen oder mehrere Verkäufe. */
export type BackofficeAction = "complete" | "cancel" | "delete";

/** Zahlen eines Verkäufers im geladenen Zeitraum, für die Liste am Rand. */
export interface SellerSummary {
  id: string;
  name: string;
  open: number;
  completed: number;
  cancelled: number;
  /** Stornos ÷ (bestätigt + storniert + offen) in Prozent; null ohne Verkäufe. */
  quote: number | null;
}

export interface BackofficeStats {
  open: number;
  completed: number;
  cancelled: number;
  /** Provision offener Verkäufe, die noch auf eine Entscheidung warten. */
  openCommission: number;
  quote: number | null;
}
