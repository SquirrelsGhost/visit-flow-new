import type { Vertical } from "../battle/battleCategories";
import type { MonthCounts } from "../crm/crmTypes";
import type { OrgDirectory } from "../teams/orgTypes";

/** Verkauftes Produkt aller Nutzer (v1 GET /admin/products); Storno steht wie im CRM als Marke in den Notizen. */
export interface AdminProduct {
  doorId: string;
  userId: string;
  category: string;
  type: string;
  timestamp: string;
  commissionEuro: number;
  notes?: string;
}

/** Erfasste Tür aller Nutzer (v1 GET /admin/doors). */
export interface AdminDoor {
  userId: string;
  timestamp: string;
  status: string;
}

export interface AdminActivity {
  products: AdminProduct[];
  doors: AdminDoor[];
}

/** Abos und Lizenzen (v1 GET /admin/payments/revenue-stats). */
export interface AdminRevenue {
  /** Monatlicher Umsatz aus laufenden Abos in Euro. */
  mrr: number;
  activeSubscriptions: number;
  /** Summe der gebuchten Team-Lizenzen. */
  licenses: number;
  /** Abos unter der vereinbarten Mindestmenge (v1 contractBreached). */
  breached: number;
  canceled: number;
  lostMrr: number;
}

/** Was auf einen Admin wartet: Zugangsanfragen, Partnerbewerbungen, Zahlungen ohne Zuordnung. */
export interface AdminTasks {
  whitelist: number;
  partners: number;
  payments: number;
}

/** Globale Schalter (v1 GET/PATCH /admin/system-settings). */
export interface SystemFlags {
  maintenanceMode: boolean;
  allowRegistration: boolean;
  bypassCompanyEmailRequirement: boolean;
}

export type SystemFlag = keyof SystemFlags;

/** Ein Tag im Verlauf der letzten zwei Wochen. */
export interface AdminDay {
  date: string;
  sales: number;
  doors: number;
}

export interface TeamRank {
  id: string;
  name: string;
  salesMonth: number;
  salesToday: number;
  people: number;
}

/** Alles, was die Kennzahlen-Karten zeigen; aus Verzeichnis und Aktivität berechnet. */
export interface AdminFigures {
  salesToday: number;
  salesYesterday: number;
  doorsToday: number;
  /** Personen mit mindestens einer Tür oder einem Verkauf heute. */
  activeToday: number;
  conversion: number;
  month: MonthCounts;
  days: AdminDay[];
  byVertical: Record<Vertical, number>;
  teams: TeamRank[];
}

export interface AdminData {
  directory: OrgDirectory;
  activity: AdminActivity;
}
