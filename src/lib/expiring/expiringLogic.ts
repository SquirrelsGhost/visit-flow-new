import type { CountedOption, ExpiringContract, ExpiringFilter, ExpiringStats, SortId, Urgency, UrgencyGroup } from "./expiringTypes";
import { ALL, URGENCIES } from "./expiringTypes";

/** Rohdaten aus v1 GET /products/admin/expiring. */
export type RawContract = Record<string, unknown>;

const text = (value: unknown) => (typeof value === "string" ? value.trim() : typeof value === "number" ? String(value) : "");
const num = (value: unknown) => (typeof value === "number" && Number.isFinite(value) ? value : undefined);
const DAY_MS = 86_400_000;
const UNKNOWN = "Unbekannt";
const NO_ADDRESS = "Keine Adresse";

export function urgencyOf(daysLeft: number): Urgency {
  if (daysLeft < 30) return "urgent";
  return daysLeft < 60 ? "medium" : "low";
}

/** Tage bis zum Ablauf, aufgerundet wie v1 calculateDaysUntilExpiry. */
export function daysUntil(expiry: string, now = new Date()): number {
  const at = new Date(expiry).getTime();
  return Number.isNaN(at) ? 0 : Math.ceil((at - now.getTime()) / DAY_MS);
}

/** Ort aus "Straße Nr, PLZ Ort" wie v1 extractCityFromAddress; leer, wenn keiner erkennbar. */
export function cityOf(address: string): string {
  if (!address || address === NO_ADDRESS) return "";
  const [, place = ""] = address.split(",");
  return place.trim().replace(/^\d{5}\s*/, "").trim();
}

/** Antwort von v1 in eigene Verträge übersetzen; fehlende Tage rechnet der Browser aus dem Ablaufdatum. */
export function toContracts(raws: readonly RawContract[], now = new Date()): ExpiringContract[] {
  return raws.map((r) => {
    const expiryDate = text(r.contractExpiryDate);
    const daysLeft = num(r.daysUntilExpiry) ?? daysUntil(expiryDate, now);
    const address = text(r.address);
    const advisorId = text(r.assignedAdvisor) || undefined;
    return {
      id: text(r.id) || text(r._id),
      doorId: text(r.doorId),
      category: text(r.category),
      type: text(r.type) || text(r.category) || UNKNOWN,
      quantity: num(r.quantity) ?? 1,
      userId: text(r.userId),
      userName: text(r.userName) || UNKNOWN,
      startDate: text(r.contractStartDate),
      expiryDate,
      daysLeft,
      urgency: urgencyOf(daysLeft),
      isLead: r.isLead === true,
      advisorId,
      advisorName: advisorId ? text(r.assignedAdvisorName) || UNKNOWN : undefined,
      assignedAt: text(r.leadAssignedAt) || undefined,
      customerName: text(r.customerName) || UNKNOWN,
      address: address === NO_ADDRESS ? "" : address,
      city: cityOf(address),
      commissionEuro: num(r.commissionEuro) ?? 0,
    };
  });
}

function matches(c: ExpiringContract, f: ExpiringFilter): boolean {
  const q = f.query.trim().toLowerCase();
  if (q && ![c.customerName, c.address, c.userName, c.type].some((v) => v.toLowerCase().includes(q))) return false;
  if (f.urgency !== ALL && c.urgency !== f.urgency) return false;
  if (f.category !== ALL && c.category !== f.category) return false;
  if (f.city !== ALL && c.city !== f.city) return false;
  if (f.assign === "assigned") return c.isLead && !!c.advisorId;
  if (f.assign === "unassigned") return c.isLead && !c.advisorId;
  return true;
}

const SORTERS: Record<SortId, (a: ExpiringContract, b: ExpiringContract) => number> = {
  days: (a, b) => a.daysLeft - b.daysLeft || a.customerName.localeCompare(b.customerName, "de"),
  commission: (a, b) => b.commissionEuro - a.commissionEuro || a.daysLeft - b.daysLeft,
  name: (a, b) => a.customerName.localeCompare(b.customerName, "de") || a.daysLeft - b.daysLeft,
};

/** Filtern wie v1 (Suche, Dringlichkeit, Kategorie, Ort, Zuweisung) und sortieren; Standard: kürzeste Restlaufzeit zuerst. */
export function filterContracts(contracts: readonly ExpiringContract[], filter: ExpiringFilter): ExpiringContract[] {
  return contracts.filter((c) => matches(c, filter)).sort(SORTERS[filter.sort]);
}

/** Nach Dringlichkeit bündeln, Reihenfolge innerhalb bleibt die der Sortierung; leere Stufen fallen weg. */
export function groupByUrgency(contracts: readonly ExpiringContract[]): UrgencyGroup[] {
  return URGENCIES.map((urgency) => ({ urgency, contracts: contracts.filter((c) => c.urgency === urgency) })).filter((g) => g.contracts.length > 0);
}

export function expiringStats(contracts: readonly ExpiringContract[]): ExpiringStats {
  const commission = contracts.reduce((n, c) => n + c.commissionEuro, 0);
  const byUrgency: Record<Urgency, number> = { urgent: 0, medium: 0, low: 0 };
  contracts.forEach((c) => byUrgency[c.urgency]++);
  const [top] = countBy(contracts, (c) => c.category).sort((a, b) => b.count - a.count);
  return {
    count: contracts.length,
    commission,
    average: contracts.length > 0 ? commission / contracts.length : 0,
    potential: contracts.filter((c) => c.isLead && !c.advisorId).reduce((n, c) => n + c.commissionEuro, 0),
    byUrgency,
    topCategory: top ? { category: top.value, count: top.count } : undefined,
  };
}

/** Werte mit Anzahl, alphabetisch; leere Werte zählen nicht. */
export function countBy(contracts: readonly ExpiringContract[], pick: (c: ExpiringContract) => string): CountedOption[] {
  const counts = new Map<string, number>();
  contracts.forEach((c) => {
    const value = pick(c);
    if (value) counts.set(value, (counts.get(value) ?? 0) + 1);
  });
  return [...counts].map(([value, count]) => ({ value, count })).sort((a, b) => a.value.localeCompare(b.value, "de"));
}

/** Anteil der verbleibenden Zeit im 90-Tage-Fenster (0 = läuft heute ab, 1 = noch volle 90 Tage). */
export const windowShare = (daysLeft: number, window: number) => Math.min(1, Math.max(0, daysLeft / window));

/** Karte springt zur Adresse (wie Straßenliste "Auf Karte"). */
export const mapHref = (address: string) => `/dashboard?q=${encodeURIComponent(address)}`;
