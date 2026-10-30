/** Ein verkauftes Produkt aus GET /products/sales (v1), schon mit Kunde und Adresse angereichert. */
export interface SaleRecord {
  id: string;
  doorId: string;
  category: string;
  subCategory?: string;
  type: string;
  quantity: number;
  timestamp: string;
  /** Status steht in v1 als Marke in den Notizen: [ABGESCHLOSSEN] oder [STORNIERT]. */
  notes?: string;
  commissionEuro: number;
  customerName: string;
  customerType?: string;
  address: string;
}

export type OrderStatus = "open" | "completed" | "cancelled";

export interface OrderProduct {
  id: string;
  type: string;
  category: string;
  quantity: number;
  commissionEuro: number;
  status: OrderStatus;
}

/** Ein Auftrag = alle Produkte einer Tür an einem Tag (v1 GroupedSale). */
export interface Order {
  id: string;
  doorId: string;
  customerName: string;
  customerType?: string;
  address: string;
  timestamp: string;
  daysSince: number;
  totalCommission: number;
  products: OrderProduct[];
  status: OrderStatus;
  /** Notiz ohne Statusmarken. */
  note?: string;
  /** Verlustgrund aus Pipedrive bzw. Notiz ("Verlustgrund: …"). */
  lostReason?: string;
}

export type OrderFilter = "all" | OrderStatus;

/** Zahlen eines Monats; ein Auftrag mit mehreren Produkten zählt einmal (v1 monthlyCounts). */
export interface MonthCounts {
  sales: number;
  stornos: number;
  open: number;
  completed: number;
  /** Stornos je Auftrag in Prozent; null ohne Aufträge. */
  quote: number | null;
  commission: number;
}
