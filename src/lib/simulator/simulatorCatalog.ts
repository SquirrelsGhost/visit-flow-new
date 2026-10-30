import type { SettingsTone } from "../settings/settingsTones";
import type { ConsultantLevel, SimTariff } from "./simulatorTypes";

export interface SimCategory {
  /** Tarif-Kategorie aus der Tarifverwaltung */
  key: string;
  label: string;
  /** Produktkategorie, unter der der Posten zählt */
  productCategory: string;
  tone: SettingsTone;
}

/** Telco-Reiter in der Reihenfolge aus v1 (ProvisionSimulator CATEGORIES). */
export const TELCO_CATEGORIES: readonly SimCategory[] = [
  { key: "kabel-neu", label: "KIP", productCategory: "KIP", tone: "blue" },
  { key: "glasfaser", label: "Glasfaser", productCategory: "Glasfaser", tone: "purple" },
  { key: "dsl", label: "DSL", productCategory: "KIP", tone: "indigo" },
  { key: "tv", label: "TV/KAS", productCategory: "KAS", tone: "amber" },
  { key: "mobil", label: "Mobil", productCategory: "Mobile", tone: "red" },
  { key: "kabel-bestand", label: "Upsell", productCategory: "Upsell", tone: "green" },
  { key: "router", label: "Router", productCategory: "Zubehör", tone: "rose" },
];

export const ENERGY_CATEGORIES: readonly SimCategory[] = [
  { key: "strom", label: "Strom", productCategory: "Strom", tone: "amber" },
  { key: "gas", label: "Gas", productCategory: "Gas", tone: "orange" },
];

/** Neuverträge, zu denen v1 automatisch "TV Connect zuhause" (KAS) legt. */
export const KIP_KEYS: readonly string[] = ["kabel-neu", "glasfaser", "dsl"];
export const TV_CONNECT = "TV Connect zuhause";

/** Feste HSI-Upsell-Grades nach Preisdifferenz (v1 HSI_GRADES, Großregion 5). */
export const HSI_GRADES: readonly SimTariff[] = [
  { id: "hsi-grade-4", name: "Upsell Grade 4 (≥15€ Diff.)", category: "kabel-bestand", commissionEuro: 108 },
  { id: "hsi-grade-3", name: "Upsell Grade 3 (10-14,99€ Diff.)", category: "kabel-bestand", commissionEuro: 93 },
  { id: "hsi-grade-2", name: "Upsell Grade 2 (5-9,99€ Diff.)", category: "kabel-bestand", commissionEuro: 78 },
  { id: "hsi-grade-1", name: "Upsell Grade 1 (1-4,99€ Diff.)", category: "kabel-bestand", commissionEuro: 63 },
  { id: "hsi-grade-0", name: "Upsell Grade 0 (0-0,99€ Mission)", category: "kabel-bestand", commissionEuro: 44 },
];

/** Aufschlag je Berater-Level ab Monat 5. */
export const LEVEL_MULTIPLIER: Record<ConsultantLevel, number> = { regulaer: 1, professional: 1.1, expert: 1.15 };

export interface MonthChoice {
  value: number;
  label: string;
}

export interface MonthPhase {
  id: "junior" | "juniorPlus" | "regular";
  tone: SettingsTone;
  months: readonly MonthChoice[];
}

/** Vertragsmonate wie in v1: Junior 1–4, Junior Plus 5–6, Regulär 7–12 und 13+. */
export const MONTH_PHASES: readonly MonthPhase[] = [
  { id: "junior", tone: "amber", months: [1, 2, 3, 4].map((m) => ({ value: m, label: String(m) })) },
  { id: "juniorPlus", tone: "green", months: [{ value: 5, label: "5" }, { value: 6, label: "6" }] },
  { id: "regular", tone: "blue", months: [{ value: 7, label: "7–12" }, { value: 13, label: "13+" }] },
];

/** Ab hier gibt es Berater-Level und Stornoquoten-Bonus. */
export const LEVEL_FROM_MONTH = 5;
export const DEFAULT_CONTRACT_MONTH = 5;

/** Ab diesem Gesamtbetrag funkelt das Ergebnis einmal (v1: Konfetti ab 200 €). */
export const CELEBRATE_FROM = 200;

/** Vertragsmonat aus dem Profil auf die Auswahl abbilden (8 → 7, 15 → 13). */
export function nearestMonth(month: number | null | undefined): number {
  if (!month || month < 1) return DEFAULT_CONTRACT_MONTH;
  if (month >= 13) return 13;
  if (month >= 7) return 7;
  return month;
}

/**
 * Energie rechnet erst mit der echten Provisionstabelle des Teams (v1: 0 €, Energie-Spec "folgt").
 * Bis dahin zeigt der Simulator einen Hinweis; der Strom/Gas-Rechner bleibt fertig im Code.
 */
export const ENERGY_COMMISSION_READY = false;
