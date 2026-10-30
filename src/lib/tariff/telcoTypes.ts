/** Typen des Telco-Tarifvergleichs (v1 PencilSellMode / pencilSellConstants). */
export type Portfolio = "kabel-neu" | "kabel-upsell" | "glasfaser" | "dsl";

export interface MetaTariff {
  id: string;
  name: string;
  a6: number;
  a79: number;
  b: number;
  credit: number;
}

/** Laufzeit-Abschnitte und Tarife eines Portfolios. */
export interface TelcoMeta {
  title: string;
  months6: number;
  label6: string;
  months79: number;
  label79: string;
  monthsB: number;
  labelB: string;
  oneOffs: number;
  tariffs: MetaTariff[];
}

export interface SimpleTariff {
  id: string;
  name: string;
  monthly: number;
}

export interface RouterOption {
  id: string;
  name: string;
  monthly: number;
  oneTime: number;
  ont?: boolean;
}

export interface GigaTvOption {
  id: string;
  name: string;
  a: number;
  b: number;
  oneTime: number;
  needsShipping?: boolean;
  includesNetflix?: boolean;
  includesPremium?: boolean;
}

export type FestnetzOption = SimpleTariff;

export interface MobilePlan {
  id: string;
  name: string;
  baseMonthly: number;
  promo20Discount: number;
  dataGb?: number;
  supportsUnlimitedUpgrade?: boolean;
}

export interface FamilyCardOption {
  id: string;
  name: string;
  dataGb: number;
  monthly: number;
}

export interface AltCosts {
  internetFestnetz: number;
  tv: number;
  sims: number[];
  sonstiges: number;
  abos: number;
}

/** Alles, was der Berater im Telco-Vergleich einstellt. */
export interface TelcoState {
  portfolio: Portfolio;
  alt: AltCosts;
  tariffId: string | undefined;
  downgradeId: string;
  routerId: string;
  gigaId: string;
  mobileId: string;
  festnetzId: string;
  applyMobileCombo: boolean;
  applyCredit: boolean;
  creditOverride: string;
  applyTvCombo: boolean;
  applyTariffChangeFeeCredit: boolean;
  gigaMultiroomCount: number;
  gigaAddNetflix: boolean;
  gigaAddPremium: boolean;
  isTvBestand: boolean;
  selectedFamilyCards: string[];
  mobileUnlimited: boolean;
  /** Geheimfunktionen, werden nicht gespeichert (wie v1). */
  loyaltyUnlocked: boolean;
  loyaltyTariffId: string;
  upsellLoyaltyUnlocked: boolean;
  upsellWinbackUnlocked: boolean;
}

export const EMPTY_ALT: AltCosts = { internetFestnetz: 0, tv: 0, sims: [0], sonstiges: 0, abos: 0 };

export const DEFAULT_TELCO_STATE: TelcoState = {
  portfolio: "kabel-neu",
  alt: EMPTY_ALT,
  tariffId: undefined,
  downgradeId: "none",
  routerId: "none",
  gigaId: "none",
  mobileId: "none",
  festnetzId: "tel_flat",
  applyMobileCombo: false,
  applyCredit: false,
  creditOverride: "",
  applyTvCombo: false,
  applyTariffChangeFeeCredit: false,
  gigaMultiroomCount: 0,
  gigaAddNetflix: false,
  gigaAddPremium: false,
  isTvBestand: false,
  selectedFamilyCards: [],
  mobileUnlimited: false,
  loyaltyUnlocked: false,
  loyaltyTariffId: "none",
  upsellLoyaltyUnlocked: false,
  upsellWinbackUnlocked: false,
};

export const hasTariff = (s: Pick<TelcoState, "tariffId">) => !!s.tariffId && s.tariffId !== "none";
export const isCable = (p: Portfolio) => p === "kabel-neu" || p === "kabel-upsell";
