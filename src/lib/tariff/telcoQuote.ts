import { computeAddons, type AddonContext } from "./telcoAddons";
import { appliedCredit, resolveNeu, upsellLoyaltyFlat } from "./telcoNeu";
import type { TelcoMeta, TelcoState } from "./telcoTypes";

const EPS = 0.005;
const same = (x: number, y: number) => Math.abs(x - y) <= EPS;

/**
 * Das komplette Angebot aus v1 PencilSellMode als reine Rechnung: Alt gegen Neu über 24 Monate
 * (36 bei Treuewechsel ab 13. Monat), Monatspreise je Abschnitt, Einmalkosten, Ersparnis.
 */
export function computeQuote(s: TelcoState, meta: TelcoMeta, ctx: AddonContext) {
  const neu = resolveNeu(s, meta);
  const add = computeAddons(s, ctx);
  const credit = appliedCredit(s, neu);

  const loyaltyActive = s.loyaltyUnlocked && s.loyaltyTariffId !== "none" && s.portfolio === "kabel-neu";
  const loyaltyTariff = meta.tariffs.find((x) => x.id === s.loyaltyTariffId);
  const loyaltyMonthlyInternet = loyaltyActive && loyaltyTariff ? loyaltyTariff.b ?? loyaltyTariff.a6 ?? 0 : 0;
  const contractMonths = loyaltyActive ? 36 : 24;
  const monthsLabelShort = `${contractMonths}M`;

  const { alt } = s;
  const altMonthly =
    Number(alt.internetFestnetz) + Number(alt.tv) + alt.sims.reduce((sum, v) => sum + Number(v || 0), 0) + Number(alt.sonstiges) + Number(alt.abos);
  const altTotal = contractMonths * altMonthly;

  const shared = add.festnetzMonthly + add.routerMonthly + add.gigaAddonMonthly + add.mobileMonthly + add.familyCardsMonthly;
  const addonsMonthly = shared + add.tvConnectStdMonthly;
  const addonsMonthlyAuto = shared + add.tvConnectStdAutoMonthly;
  const oneTimeCosts = neu.oneOffs + add.combinedShipping + add.routerOneTime + add.routerONT + add.gigaOneTime;
  const flat = upsellLoyaltyFlat(s);

  let neuTotal: number;
  if (flat) {
    neuTotal = 24 * (neu.a6 + addonsMonthly + add.gigaMonthlyACombo) + oneTimeCosts - credit;
  } else {
    const addA = addonsMonthly + add.gigaMonthlyACombo;
    const addB = addonsMonthly + add.gigaMonthlyBCombo;
    const m1324 = loyaltyActive ? Math.min(12, meta.monthsB) : 0;
    const m1012 = meta.monthsB - m1324;
    const later = loyaltyActive ? loyaltyMonthlyInternet : neu.b;
    neuTotal =
      meta.months6 * (neu.a6 + addA) +
      meta.months79 * (neu.a79 + addB) +
      m1012 * (neu.b + addB) +
      m1324 * (later + addB) +
      (loyaltyActive ? 12 : 0) * (later + addB) +
      oneTimeCosts -
      credit;
  }
  const neuAvg = neuTotal / contractMonths;
  const ersparnis = Math.max(0, altTotal - neuTotal);

  const price1to6 = neu.a6 + addonsMonthly + add.gigaMonthlyACombo;
  const price7to9 = neu.a79 + addonsMonthly + add.gigaMonthlyBCombo;
  const price10to24 = neu.b + addonsMonthly + add.gigaMonthlyBCombo;
  const price10to12 = neu.b + addonsMonthlyAuto + add.gigaMonthlyBCombo;
  const price13to24 = (loyaltyActive ? loyaltyMonthlyInternet : neu.b) + addonsMonthlyAuto + add.gigaMonthlyBCombo;

  const showSplitEarly = meta.months6 > 0 && meta.months79 > 0 && !same(price1to6, price7to9);
  const parts = [meta.months6 > 0 && price1to6, meta.months79 > 0 && price7to9, meta.monthsB > 0 && price10to24].filter(
    (p): p is number => p !== false,
  );
  const showFlatAllMonths = flat || (parts.length > 0 && parts.every((p) => same(p, parts[0] as number)));
  const merge79AndB = meta.months79 > 0 && meta.monthsB > 0 && same(price7to9, price10to24);

  return {
    neu,
    add,
    credit,
    loyaltyActive,
    loyaltyMonthlyInternet,
    contractMonths,
    monthsLabelShort,
    altMonthly,
    altTotal,
    addonsMonthly,
    oneTimeCosts,
    neuTotal,
    neuAvg,
    ersparnis,
    prices: { price1to6, price7to9, price10to24, price10to12, price13to24 },
    showSplitEarly,
    showFlatAllMonths,
    merge79AndB,
  };
}

export type TelcoQuote = ReturnType<typeof computeQuote>;
