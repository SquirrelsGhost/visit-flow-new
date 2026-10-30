import { bonusCategoriesFor, bonusProgress, type BonusProgress } from "../assistant/bonusTiers";
import type { BonusCategory } from "../assistant/meTypes";
import type { SimProduct } from "./simulatorTypes";

/** Produktkategorie → Bonuskategorie. KAS zählt nicht, nur GigaTV (v1 CATEGORY_TO_BONUS). */
const CATEGORY_TO_BONUS: Readonly<Record<string, string>> = {
  KIP: "kip",
  Glasfaser: "kip",
  GigaTV: "gigatv",
  Mobile: "mobile",
  Upsell: "kip-upsell",
};

export interface BonusUnits {
  kip: number;
  gigatv: number;
  mobile: number;
  upsell: number;
}

export function unitsOf(products: readonly SimProduct[]): BonusUnits {
  const units: BonusUnits = { kip: 0, gigatv: 0, mobile: 0, upsell: 0 };
  for (const p of products) {
    const bonus = CATEGORY_TO_BONUS[p.category];
    if (bonus === "kip") units.kip += p.quantity;
    else if (bonus === "gigatv") units.gigatv += p.quantity;
    else if (bonus === "mobile") units.mobile += p.quantity;
    else if (bonus === "kip-upsell") units.upsell += p.quantity;
  }
  return units;
}

/**
 * Stückzahlen je Bonuskategorie wie v1: Junior (1–4) zählt KIP und GigaTV zusammen. Junior Plus (5–6) gibt den
 * Regulär-Bonus bei 10 KIP oder 10 GigaTV, Regulär (7+) ab 30 KIP+GigaTV+Mobile; Stornoquote ab 10 KIP und 10 GigaTV.
 */
export function bonusCounts(month: number, u: BonusUnits, stornoOk: boolean): Record<string, number> {
  const counts: Record<string, number> = { kip: u.kip, gigatv: u.gigatv, mobile: u.mobile, "kip-upsell": u.upsell, "kip-gigatv": u.kip + u.gigatv };
  if (month < 5) return counts;
  if (month <= 6) {
    const reached = u.kip >= 10 || u.gigatv >= 10;
    counts["regulaer-bonus"] = reached ? 30 : 0;
    counts.stornoquote = stornoOk && reached ? 1 : 0;
  } else {
    counts["regulaer-bonus"] = u.kip + u.gigatv + u.mobile;
    counts.stornoquote = stornoOk && u.kip >= 10 && u.gigatv >= 10 ? 1 : 0;
  }
  return counts;
}

export interface BonusRow {
  category: BonusCategory;
  count: number;
  progress: BonusProgress;
}

export interface BonusResult {
  rows: BonusRow[];
  total: number;
}

/** Bonus-Staffeln für einen Warenkorb oder reine Stückzahlen. */
export function telcoBonus(month: number, units: BonusUnits, stornoOk: boolean): BonusResult {
  const counts = bonusCounts(month, units, stornoOk);
  const rows = bonusCategoriesFor(month).map((category) => {
    const count = counts[category.id] ?? 0;
    return { category, count, progress: bonusProgress(category, count) };
  });
  return { rows, total: rows.reduce((sum, r) => sum + r.progress.amount, 0) };
}
