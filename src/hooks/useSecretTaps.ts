import { useCallback, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { toast } from "sonner";
import { TELCO_FEES } from "../lib/tariff/telcoCatalog";
import type { TelcoState } from "../lib/tariff/telcoTypes";
import { pencilSellSecretTexts as t } from "../texts/pencilSellTexts";

const LOYALTY = TELCO_FEES.secretTapsLoyalty;
const WINBACK = TELCO_FEES.secretTapsWinback;

/**
 * Geheimfunktion aus v1: Tippen auf "Internet + Festnetz".
 * Kabel Upsell: 5× Treuepreise, 10× Winback. Sonst 5× "Treuewechsel ab 13. Monat",
 * beim 3. Tippen kommt einmalig eine Warnung.
 */
export function useSecretTaps(state: TelcoState, setState: Dispatch<SetStateAction<TelcoState>>) {
  const upsellTaps = useRef(0);
  const loyaltyTaps = useRef(0);
  const warnShown = useRef(false);
  const [warn, setWarn] = useState<{ open: boolean; remaining: number }>({ open: false, remaining: 0 });

  const tap = useCallback(() => {
    if (state.portfolio === "kabel-upsell") {
      const c = ++upsellTaps.current;
      if (c === LOYALTY && !state.upsellLoyaltyUnlocked) {
        setState((s) => ({ ...s, upsellLoyaltyUnlocked: true }));
        toast(t.upsellLoyalty);
      }
      if (c >= WINBACK && !state.upsellWinbackUnlocked) {
        setState((s) => ({ ...s, upsellWinbackUnlocked: true }));
        upsellTaps.current = 0;
        toast(t.upsellWinback);
      }
      return;
    }
    if (state.loyaltyUnlocked) return;
    const c = loyaltyTaps.current + 1;
    if (!warnShown.current && c === LOYALTY - 2) {
      warnShown.current = true;
      setWarn({ open: true, remaining: LOYALTY - c });
    }
    if (c >= LOYALTY) {
      loyaltyTaps.current = 0;
      setState((s) => ({ ...s, loyaltyUnlocked: true }));
      setWarn((w) => ({ ...w, open: false }));
      toast(t.loyalty);
    } else {
      loyaltyTaps.current = c;
    }
  }, [state.portfolio, state.upsellLoyaltyUnlocked, state.upsellWinbackUnlocked, state.loyaltyUnlocked, setState]);

  const closeWarn = useCallback(() => setWarn((w) => ({ ...w, open: false })), []);
  return { tap, warn, closeWarn };
}
