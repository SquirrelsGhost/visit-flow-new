import { describe, expect, it } from "vitest";
import { oneTimeCosts } from "../lib/tariff/tariffConvert";
import { buildMeta, internetTariffs } from "../lib/tariff/telcoMeta";
import { buildFamilyCards, buildMobilePlans } from "../lib/tariff/telcoMobile";
import { buildGigaTvOptions, buildRouterOptions } from "../lib/tariff/telcoOptions";
import { computeQuote } from "../lib/tariff/telcoQuote";
import { DEFAULT_TELCO_STATE, type TelcoState } from "../lib/tariff/telcoTypes";

/** Rechnet wie der Hook, aber mit den eingebauten Standardtarifen (Demo-Modus, keine Verwaltung). */
function quote(patch: Partial<TelcoState>) {
  const state: TelcoState = { ...DEFAULT_TELCO_STATE, ...patch };
  const costs = oneTimeCosts([]);
  const meta = buildMeta(state.portfolio, internetTariffs(state.portfolio, []), costs.setup);
  return computeQuote(state, meta, {
    gigaOptions: buildGigaTvOptions(false, []),
    routerOptions: buildRouterOptions(state.portfolio, []),
    mobilePlans: buildMobilePlans([]),
    familyCards: buildFamilyCards([]),
    gigaKombiDiscount: 0,
    shipping: costs.shipping,
  });
}

describe("computeQuote", () => {
  it("rechnet Kabel 1000 über 24 Monate wie v1", () => {
    const q = quote({ portfolio: "kabel-neu", tariffId: "k1000" });
    expect(q.contractMonths).toBe(24);
    expect(q.neuTotal).toBeCloseTo(1204.75, 2);
  });

  it("zieht die heutigen Kosten für die Ersparnis ab", () => {
    const q = quote({ portfolio: "kabel-neu", tariffId: "k1000", alt: { ...DEFAULT_TELCO_STATE.alt, internetFestnetz: 80 } });
    expect(q.altTotal).toBe(1920);
    expect(q.ersparnis).toBeCloseTo(715.25, 2);
  });
});
