import type { BonusCategory, BonusTier } from "./meTypes";

const MOBILE: BonusCategory = {
  id: "mobile",
  name: "Mobile",
  icon: "smartphone",
  gradient: "from-green-500 to-green-600",
  tiers: [
    { stufe: 1, target: 5, bonusAmount: 15, perProduct: true },
    { stufe: 2, target: 10, bonusAmount: 25, perProduct: true },
    { stufe: 3, target: 15, bonusAmount: 35, perProduct: true },
  ],
};

/** Junior-Staffeln KIP + GigaTV je Vertragsmonat 1–4. */
const JUNIOR_TARGETS: Record<number, [number, number, number]> = {
  1: [5, 10, 15],
  2: [10, 15, 20],
  3: [15, 20, 30],
  4: [20, 30, 40],
};

const REGULAR: readonly BonusCategory[] = [
  { id: "kip", name: "Internet & Phone (KIP)", icon: "wifi", gradient: "from-red-500 to-red-600", tiers: [{ stufe: 1, target: 10, bonusAmount: 30, perProduct: true }, { stufe: 2, target: 20, bonusAmount: 40, perProduct: true }, { stufe: 3, target: 30, bonusAmount: 50, perProduct: true }] },
  { id: "kip-upsell", name: "KIP Upsell", icon: "trending-up", gradient: "from-pink-500 to-pink-600", tiers: [{ stufe: 1, target: 10, bonusAmount: 10, perProduct: true }, { stufe: 2, target: 15, bonusAmount: 15, perProduct: true }, { stufe: 3, target: 20, bonusAmount: 30, perProduct: true }] },
  { id: "gigatv", name: "GigaTV", icon: "tv", gradient: "from-purple-500 to-purple-600", tiers: [{ stufe: 1, target: 10, bonusAmount: 20, perProduct: true }, { stufe: 2, target: 20, bonusAmount: 30, perProduct: true }, { stufe: 3, target: 30, bonusAmount: 40, perProduct: true }] },
  MOBILE,
  { id: "regulaer-bonus", name: "1.000€ Regulär-Bonus", icon: "award", gradient: "from-amber-500 to-amber-600", tiers: [{ stufe: 1, target: 30, bonusAmount: 1000 }] },
  { id: "stornoquote", name: "750€ Stornoquote", icon: "shield-check", gradient: "from-teal-500 to-teal-600", tiers: [{ stufe: 1, target: 1, bonusAmount: 750 }] },
];

/** Vodafone-Bonuskategorien nach Vertragsmonat, Tabellen 1:1 aus v1 (utils/vodafone/bonusCalculator). */
export function bonusCategoriesFor(contractMonth: number): readonly BonusCategory[] {
  const junior = JUNIOR_TARGETS[contractMonth];
  if (!junior) return REGULAR;
  const tiers = junior.map((target, i) => ({ stufe: i + 1, target, bonusAmount: (i + 1) * 1000 }));
  return [{ id: "kip-gigatv", name: "KIP + GigaTV", icon: "wifi-tv", gradient: "from-purple-500 to-purple-600", tiers }, MOBILE];
}

export interface BonusProgress {
  reached: BonusTier | null;
  nextTarget: number | null;
  progress: number;
  remaining: number;
  /** Bonus der erreichten Stufe; je Produkt nur, wo die Stufe so abgerechnet wird. */
  amount: number;
}

/** Fortschritt zur nächsten Staffel wie v1 calculateBonusProgress. */
export function bonusProgress(category: BonusCategory, count: number): BonusProgress {
  const { tiers } = category;
  const reachedIndex = tiers.findLastIndex((t) => count >= t.target);
  const reached = tiers[reachedIndex] ?? null;
  const next = tiers[reachedIndex + 1] ?? null;
  const amount = reached ? (reached.perProduct ? count * reached.bonusAmount : reached.bonusAmount) : 0;
  if (!next) return { reached, nextTarget: null, progress: reached ? 100 : 0, remaining: 0, amount };
  const from = reached?.target ?? 0;
  const progress = Math.min(100, Math.max(0, ((count - from) / (next.target - from)) * 100));
  return { reached, nextTarget: next.target, progress, remaining: next.target - count, amount };
}
