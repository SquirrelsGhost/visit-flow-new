import { useCallback, useMemo, useState } from "react";
import { LEVEL_FROM_MONTH, LEVEL_MULTIPLIER, type SimCategory } from "../lib/simulator/simulatorCatalog";
import { addTelcoTariff } from "../lib/simulator/simulatorBasket";
import type { ConsultantLevel, SimTariff, TariffsByCategory } from "../lib/simulator/simulatorTypes";
import { autopilot } from "../lib/simulator/telcoAutopilot";
import { telcoBonus, unitsOf, type BonusResult } from "../lib/simulator/telcoBonus";
import { stornoOk as quoteHolds } from "../lib/crm/crmLogic";
import type { StornoQuote } from "./useStornoQuote";
import { useSimBasket, type SimBasket } from "./useSimBasket";

export interface TelcoSimulator {
  basket: SimBasket;
  month: number;
  setMonth: (month: number) => void;
  level: ConsultantLevel;
  setLevel: (level: ConsultantLevel) => void;
  stornoOk: boolean;
  toggleStorno: () => void;
  /** Level und Stornoquote gibt es erst ab Monat 5 */
  hasLevel: boolean;
  provision: number;
  bonus: BonusResult;
  add: (tariff: SimTariff, category: SimCategory) => void;
  /** false, wenn passende Tarife fehlen */
  runAutopilot: (target: number) => boolean;
}

/** Zustand und Rechnung des Telco-Simulators (v1 ProvisionSimulator, Reiter Telco). */
export function useTelcoSimulator(tariffs: TariffsByCategory, initialMonth: number, quote?: StornoQuote): TelcoSimulator {
  const basket = useSimBasket();
  const [month, setMonth] = useState(initialMonth);
  const [level, setLevel] = useState<ConsultantLevel>("regulaer");
  // Vorbelegt mit der echten Quote aus den Aufträgen, bis man selbst schaltet
  const [manualStorno, setManualStorno] = useState<boolean | null>(null);
  const stornoOk = manualStorno ?? (quote === undefined ? true : quoteHolds(quote));
  const hasLevel = month >= LEVEL_FROM_MONTH;
  // v1 rechnet den Level-Aufschlag unabhängig vom Monat; die Auswahl gibt es aber nur ab Monat 5
  const multiplier = hasLevel ? LEVEL_MULTIPLIER[level] : 1;

  const bonus = useMemo(() => telcoBonus(month, unitsOf(basket.products), stornoOk), [month, basket.products, stornoOk]);
  const { commit, products } = basket;

  const add = useCallback((tariff: SimTariff, category: SimCategory) => commit(addTelcoTariff(products, tariff, category, tariffs)), [commit, products, tariffs]);

  const runAutopilot = useCallback(
    (target: number) => {
      const next = autopilot(tariffs, { target, month, multiplier, stornoOk });
      if (next.length === 0) return false;
      commit(next);
      return true;
    },
    [tariffs, month, multiplier, stornoOk, commit],
  );

  return {
    basket,
    month,
    setMonth,
    level,
    setLevel,
    stornoOk,
    toggleStorno: () => setManualStorno(!stornoOk),
    hasLevel,
    provision: basket.base * multiplier,
    bonus,
    add,
    runAutopilot,
  };
}
