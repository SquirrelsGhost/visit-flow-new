/** Tarif, wie ihn der Simulator braucht (v1 /api/simulate/tariffs-grouped). */
export interface SimTariff {
  id: string;
  name: string;
  category: string;
  commissionEuro: number;
  bandwidth?: number;
  /** Erster Preis aus den Laufzeit-Perioden, falls vorhanden */
  price?: number;
}

/** Tarife je Tarif-Kategorie (kabel-neu, tv, mobil, strom, …). */
export type TariffsByCategory = Readonly<Record<string, readonly SimTariff[]>>;

/** Ein Posten im Warenkorb. `commission` ist der Betrag je Stück. */
export interface SimProduct {
  id: string;
  /** Produktkategorie wie beim Verkauf (KIP, GigaTV, KAS, Mobile, Upsell, Zubehör, Strom, Gas) */
  category: string;
  name: string;
  quantity: number;
  commission: number;
}

export type ConsultantLevel = "regulaer" | "professional" | "expert";

export type LeadRole = "berater" | "ausbilder" | "teamleiter" | "partner";

/** Welcher Simulator läuft; folgt der Sparte (Lead = solar). */
export type SimulatorKind = "telco" | "lead" | "energy";

/** Monatsziel im v1-Format (localStorage "provisionGoal"), damit "Ich" und v1 es lesen können. */
export interface ProvisionGoal {
  targetProvision: number;
  targetBonus: number;
  targetTotal: number;
  targetTotalProducts?: number;
  products: { name: string; category: string; quantity: number }[];
  contractMonth: number;
  savedAt: string;
  savedMonth: number;
  savedYear: number;
}
