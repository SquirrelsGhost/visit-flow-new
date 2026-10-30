import { FESTNETZ_PLANS, TELCO_FEES as FEES } from "./telcoCatalog";
import { NEW_TV_TARIFF_IDS } from "./telcoTvCatalog";
import type { FamilyCardOption, GigaTvOption, MobilePlan, RouterOption, TelcoState } from "./telcoTypes";
import { hasTariff, isCable } from "./telcoTypes";

export interface AddonContext {
  gigaOptions: GigaTvOption[];
  routerOptions: RouterOption[];
  mobilePlans: MobilePlan[];
  familyCards: FamilyCardOption[];
  gigaKombiDiscount: number;
  shipping: number;
}

const addonCost = (options: GigaTvOption[], withId: string) => {
  const basic = options.find((o) => o.id === "gtv_basic");
  const other = options.find((o) => o.id === withId);
  return basic && other ? Math.max(0, other.b - basic.b) : FEES.addonFallback;
};

/** Zubehör, TV, Festnetz und Mobile mit allen Rabatten aus v1 (monatlich und einmalig). */
export function computeAddons(s: TelcoState, ctx: AddonContext) {
  const giga = ctx.gigaOptions.find((o) => o.id === s.gigaId);
  const router = ctx.routerOptions.find((o) => o.id === s.routerId);
  const mobile = ctx.mobilePlans.find((o) => o.id === s.mobileId);
  const cable = isCable(s.portfolio);
  const withTariff = hasTariff(s);
  const isGigaTvId = s.gigaId.startsWith("gtv_");

  const gigaOneTime = s.portfolio === "kabel-neu" ? 0 : (giga?.oneTime ?? 0);
  const needsRouterShipping = s.routerId !== "none" && cable;
  const combinedShipping = needsRouterShipping || giga?.needsShipping ? ctx.shipping : 0;
  const tariffChangeFee = s.portfolio === "kabel-upsell" && withTariff && !s.applyTariffChangeFeeCredit ? FEES.tariffChange : 0;

  const tvComboEligible = cable && isGigaTvId;
  const tvAutoDiscount = cable && withTariff ? FEES.tvAutoDiscount : 0;
  const manualTvDiscount = tvComboEligible && s.applyTvCombo ? FEES.tvCombo : 0;
  const gigaDiscount = manualTvDiscount + (NEW_TV_TARIFF_IDS.includes(s.gigaId) ? tvAutoDiscount : 0);
  const tvConnectStdAutoMonthly = isGigaTvId ? FEES.tvConnectStandard : 0;
  const tvConnectStdMonthly = Math.max(0, tvConnectStdAutoMonthly - tvAutoDiscount);
  const gigaMonthlyACombo = Math.max(0, (giga?.a ?? 0) - gigaDiscount);
  const gigaMonthlyBCombo = Math.max(0, (giga?.b ?? 0) - gigaDiscount);

  const premiumIncluded = !!giga?.includesPremium;
  const netflixIncluded = !!giga?.includesNetflix;
  const premiumAddonCost = addonCost(ctx.gigaOptions, "gtv_premium");
  const netflixAddonCost = addonCost(ctx.gigaOptions, "gtv_netflix");
  const gigaAddonMonthly =
    Math.min(FEES.multiroomMax, Math.max(0, s.gigaMultiroomCount)) * FEES.multiroom +
    (!netflixIncluded && s.gigaAddNetflix ? netflixAddonCost : 0) +
    (!premiumIncluded && s.gigaAddPremium ? premiumAddonCost : 0);

  const festnetz = FESTNETZ_PLANS.find((o) => o.id === s.festnetzId);
  const festnetzMonthly = withTariff ? (festnetz?.monthly ?? 0) : 0;

  const canApplyMobileCombo = s.mobileId !== "none";
  const mobilePromo20 = mobile?.promo20Discount ?? 0;
  const mobileCombo = canApplyMobileCombo && s.applyMobileCombo ? ctx.gigaKombiDiscount : 0;
  const mobileMonthly = Math.max(0, (mobile?.baseMonthly ?? 0) - mobilePromo20 - mobileCombo);
  const familyCardsMonthly = s.selectedFamilyCards.reduce(
    (sum, id) => sum + (ctx.familyCards.find((c) => c.id === id)?.monthly ?? 0),
    0,
  );

  const routerMonthly = router?.monthly ?? 0;
  const routerOneTime = router?.oneTime ?? 0;
  const routerONT = (s.portfolio === "dsl" || s.portfolio === "glasfaser") && router?.ont ? FEES.ont : 0;

  return {
    giga,
    router,
    mobile,
    festnetz,
    gigaOneTime,
    combinedShipping,
    tariffChangeFee,
    tvComboEligible,
    tvAutoDiscount,
    tvConnectStdAutoMonthly,
    tvConnectStdMonthly,
    gigaMonthlyACombo,
    gigaMonthlyBCombo,
    premiumIncluded,
    netflixIncluded,
    premiumAddonCost,
    netflixAddonCost,
    gigaAddonMonthly,
    festnetzMonthly,
    canApplyMobileCombo,
    mobilePromo20,
    mobileMonthly,
    familyCardsMonthly,
    routerMonthly,
    routerOneTime,
    routerONT,
  };
}

export type TelcoAddons = ReturnType<typeof computeAddons>;
