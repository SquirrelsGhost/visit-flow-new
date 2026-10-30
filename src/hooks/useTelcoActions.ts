import { useMemo, type Dispatch, type SetStateAction } from "react";
import { clearTelcoState } from "../lib/tariff/pencilSellStorage";
import type { AltCosts, MobilePlan, Portfolio, TelcoState } from "../lib/tariff/telcoTypes";
import { DEFAULT_TELCO_STATE, EMPTY_ALT, isCable } from "../lib/tariff/telcoTypes";

/**
 * Änderungen am Angebot. Abhängige Felder werden gleich mit zurückgesetzt (in v1 erledigten das
 * Effekte nach dem Rendern), z.B. leert "Kein Mobile" auch Family Cards, Unlimited und GigaKombi.
 */
export function useTelcoActions(setState: Dispatch<SetStateAction<TelcoState>>, mobilePlans: MobilePlan[]) {
  return useMemo(() => {
    const patch = (p: Partial<TelcoState>) => setState((s) => ({ ...s, ...p }));
    const setAlt = (p: Partial<AltCosts>) => setState((s) => ({ ...s, alt: { ...s.alt, ...p } }));
    return {
      patch,
      setAlt,
      setPortfolio: (portfolio: Portfolio) => patch({ portfolio, tariffId: undefined, downgradeId: "none" }),
      selectTariff: (tariffId: string) =>
        setState((s) => ({
          ...s,
          tariffId,
          downgradeId: "none",
          routerId: tariffId === "none" ? "none" : s.routerId,
          gigaId: tariffId !== "none" && s.gigaId === "none" && isCable(s.portfolio) ? "tv_connect_standard" : s.gigaId,
        })),
      removeTariff: () => patch({ tariffId: "none", downgradeId: "none", routerId: "none" }),
      setMobileId: (mobileId: string) =>
        setState((s) => {
          if (mobileId === "none") return { ...s, mobileId, selectedFamilyCards: [], mobileUnlimited: false, applyMobileCombo: false };
          const supportsUnlimited = !!mobilePlans.find((p) => p.id === mobileId)?.supportsUnlimitedUpgrade;
          return { ...s, mobileId, mobileUnlimited: supportsUnlimited && s.mobileUnlimited };
        }),
      addSim: () => setState((s) => ({ ...s, alt: { ...s.alt, sims: [...s.alt.sims, 0] } })),
      setSim: (index: number, value: number) =>
        setState((s) => ({ ...s, alt: { ...s.alt, sims: s.alt.sims.map((v, i) => (i === index ? value : v)) } })),
      removeSim: (index: number) => setState((s) => ({ ...s, alt: { ...s.alt, sims: s.alt.sims.filter((_, i) => i !== index) } })),
      clear: () => {
        clearTelcoState();
        setState((s) => ({
          ...DEFAULT_TELCO_STATE,
          alt: EMPTY_ALT,
          loyaltyUnlocked: s.loyaltyUnlocked,
          loyaltyTariffId: s.loyaltyTariffId,
          upsellLoyaltyUnlocked: s.upsellLoyaltyUnlocked,
          upsellWinbackUnlocked: s.upsellWinbackUnlocked,
          isTvBestand: s.isTvBestand,
        }));
      },
    };
  }, [setState, mobilePlans]);
}

export type TelcoActions = ReturnType<typeof useTelcoActions>;
