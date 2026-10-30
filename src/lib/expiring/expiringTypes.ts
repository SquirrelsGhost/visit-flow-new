/** Wie v1: das Fenster ist fest 90 Tage (ContractService.getExpiringContracts, Seite nicht änderbar). */
export const DAYS_WINDOW = 90;

/** Dringlichkeit wie v1 ContractService.getUrgencyLevel: unter 30, unter 60, sonst niedrig. */
export type Urgency = "urgent" | "medium" | "low";
export const URGENCIES: readonly Urgency[] = ["urgent", "medium", "low"];

/** Ein Vertrag, dessen Laufzeit (v1: Start + 2 Jahre) in den nächsten 90 Tagen endet. */
export interface ExpiringContract {
  id: string;
  doorId: string;
  category: string;
  type: string;
  quantity: number;
  userId: string;
  userName: string;
  startDate: string;
  expiryDate: string;
  daysLeft: number;
  urgency: Urgency;
  /** v1 is_lead: nur Leads lassen sich einem Berater zuweisen. */
  isLead: boolean;
  advisorId?: string;
  advisorName?: string;
  assignedAt?: string;
  customerName: string;
  address: string;
  city: string;
  commissionEuro: number;
}

export const ALL = "all";
export type AssignFilter = "all" | "assigned" | "unassigned";
export type SortId = "days" | "commission" | "name";

export interface ExpiringFilter {
  urgency: Urgency | typeof ALL;
  category: string;
  city: string;
  assign: AssignFilter;
  query: string;
  sort: SortId;
}

export interface UrgencyGroup {
  urgency: Urgency;
  contracts: ExpiringContract[];
}

export interface ExpiringStats {
  count: number;
  commission: number;
  average: number;
  /** v1 "Potenzial": Provision der Leads ohne Berater. */
  potential: number;
  byUrgency: Record<Urgency, number>;
  topCategory?: { category: string; count: number };
}

/** Auswahl mit Anzahl (Kategorie, Ort). */
export interface CountedOption {
  value: string;
  count: number;
}

/** Berater, dem ein Lead zugewiesen werden kann (v1 AssignAdvisorDialog: alle aktiven Nutzer). */
export interface Advisor {
  id: string;
  name: string;
  role: string;
}
