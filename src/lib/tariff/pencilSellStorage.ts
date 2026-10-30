import { readPreference, writePreference } from "../preferences";
import { DEFAULT_TELCO_STATE, type TelcoState } from "./telcoTypes";

/** Schlüssel wie in v1, damit ein offenes Angebot den Umstieg übersteht. */
const OFFER_KEY = "pencil_sell_offer";
const SAVINGS_KEY = "pencil_sell_ersparnis";
const TRANSFER_KEY = "pencil_sell_transfer";

const PERSISTED = [
  "portfolio",
  "alt",
  "tariffId",
  "downgradeId",
  "routerId",
  "gigaId",
  "mobileId",
  "festnetzId",
  "applyMobileCombo",
  "applyCredit",
  "creditOverride",
  "applyTvCombo",
  "applyTariffChangeFeeCredit",
  "gigaMultiroomCount",
  "gigaAddNetflix",
  "gigaAddPremium",
  "isTvBestand",
  "selectedFamilyCards",
  "mobileUnlimited",
] as const satisfies readonly (keyof TelcoState)[];

const PORTFOLIOS = ["kabel-neu", "kabel-upsell", "glasfaser", "dsl"];

/** Gespeichertes Angebot (v1 loadPersistedState), fehlende Felder mit Standardwerten. */
export function loadTelcoState(): TelcoState {
  try {
    const parsed: unknown = JSON.parse(readPreference(OFFER_KEY) ?? "null");
    if (!parsed || typeof parsed !== "object") return DEFAULT_TELCO_STATE;
    const saved = parsed as Partial<TelcoState>;
    if (!PORTFOLIOS.includes(String(saved.portfolio))) return DEFAULT_TELCO_STATE;
    const picked = Object.fromEntries(PERSISTED.filter((k) => k in saved).map((k) => [k, saved[k]]));
    return { ...DEFAULT_TELCO_STATE, ...picked, alt: { ...DEFAULT_TELCO_STATE.alt, ...saved.alt } };
  } catch {
    return DEFAULT_TELCO_STATE;
  }
}

export function saveTelcoState(state: TelcoState): void {
  writePreference(OFFER_KEY, JSON.stringify(Object.fromEntries(PERSISTED.map((k) => [k, state[k]]))));
}

/** Ersparnis für andere Ansichten (v1 NeighborEffectCard). */
export function saveSavings(ersparnis: number, neuAvg: number, portfolio: string): void {
  writePreference(SAVINGS_KEY, JSON.stringify({ ersparnis, neuAvg, portfolio, timestamp: Date.now() }));
}

export function clearTelcoState(): void {
  writePreference(OFFER_KEY, null);
  writePreference(SAVINGS_KEY, null);
}

export interface TransferProduct {
  category: string;
  type: string;
  quantity: number;
  /** Zusatzangaben, z.B. Verbrauch und Ersparnis bei Strom und Gas */
  details?: Record<string, string | number | boolean>;
}

/** Produkte für den Verkaufsdialog der Übersicht (v1 pencil_sell_transfer). */
export function saveTransfer(products: TransferProduct[]): void {
  writePreference(TRANSFER_KEY, JSON.stringify({ products, timestamp: Date.now() }));
}

/** Übernommene Produkte für den nächsten Verkauf auf der Karte; leer, wenn nichts übernommen wurde. */
export function readTransfer(): TransferProduct[] {
  try {
    const parsed = JSON.parse(readPreference(TRANSFER_KEY) ?? "null") as { products?: unknown } | null;
    return Array.isArray(parsed?.products) ? (parsed.products as TransferProduct[]) : [];
  } catch {
    return [];
  }
}

/** Nach dem gespeicherten Verkauf aufräumen (v1 SaleDialog handleSubmit). */
export function clearTransfer(): void {
  writePreference(TRANSFER_KEY, null);
}
