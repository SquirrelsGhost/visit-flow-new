import { FAMILY_CARDS, MOBILE_PLANS } from "./telcoTvCatalog";
import { periodPrices } from "./tariffConvert";
import type { Tariff } from "./tariffTypes";
import type { FamilyCardOption, MobilePlan } from "./telcoTypes";

const MOBILE_SIZES: Record<string, number> = { XS: 1, S: 2, M: 3, L: 4, XL: 5 };
const CARD_SIZES: Record<string, number> = { S: 1, M: 2, L: 3, XL: 4 };

const sizeRank = (name: string, sizes: Record<string, number>, pattern: RegExp, fallback?: number) => {
  const size = name.match(pattern)?.[1]?.toUpperCase();
  return (size && sizes[size]) || fallback || 999;
};

const isFamilyCard = (t: Tariff) => !!t.isFamilyCard || t.name.toLowerCase().includes("family card");

/** GigaMobil-Tarife aus der Verwaltung, sortiert XS bis XL (v1 mobilePlans), sonst die Standardliste. */
export function buildMobilePlans(mobile: Tariff[]): MobilePlan[] {
  if (mobile.length === 0) return MOBILE_PLANS;
  const plans: MobilePlan[] = mobile
    .filter((t) => !isFamilyCard(t) && t.isActive)
    .map((t) => ({
      id: t.id,
      name: t.name,
      baseMonthly: periodPrices(t).a,
      promo20Discount: t.promoDiscount || 0,
      ...(t.mobileData != null ? { dataGb: t.mobileData } : {}),
      ...(t.supportsUnlimitedUpgrade != null ? { supportsUnlimitedUpgrade: t.supportsUnlimitedUpgrade } : {}),
    }))
    .sort(
      (a, b) =>
        sizeRank(a.name, MOBILE_SIZES, /\b(XS|S|M|L|XL)\b/i, a.dataGb) -
        sizeRank(b.name, MOBILE_SIZES, /\b(XS|S|M|L|XL)\b/i, b.dataGb),
    );
  return [{ id: "none", name: "Kein Mobile", baseMonthly: 0, promo20Discount: 0 }, ...plans];
}

/** Family Cards aus der Verwaltung, sortiert S bis XL, sonst die Standardkarten. */
export function buildFamilyCards(mobile: Tariff[]): FamilyCardOption[] {
  const cards = mobile.filter((t) => t.isFamilyCard && t.isActive);
  if (cards.length === 0) return FAMILY_CARDS;
  return cards
    .map((t) => ({ id: t.id, name: t.name, dataGb: t.mobileData || 0, monthly: periodPrices(t).a }))
    .sort(
      (a, b) =>
        sizeRank(a.name, CARD_SIZES, /\b(S|M|L|XL)\b(?!\w)/i, a.dataGb) -
        sizeRank(b.name, CARD_SIZES, /\b(S|M|L|XL)\b(?!\w)/i, b.dataGb),
    );
}

/** GigaKombi-Rabatt des Tarifs, Standard 10 €. */
export const gigaKombiDiscount = (mobile: Tariff[], mobileId: string) =>
  mobile.find((t) => t.id === mobileId)?.gigaKombiDiscount ?? 10;
