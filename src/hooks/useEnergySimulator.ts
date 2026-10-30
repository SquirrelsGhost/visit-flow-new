import { useCallback } from "react";
import type { SimCategory } from "../lib/simulator/simulatorCatalog";
import { mergeOrAdd } from "../lib/simulator/simulatorBasket";
import type { SimTariff, TariffsByCategory } from "../lib/simulator/simulatorTypes";
import { energyAutopilot } from "../lib/simulator/telcoAutopilot";
import { useSimBasket, type SimBasket } from "./useSimBasket";

export interface EnergySimulator {
  basket: SimBasket;
  add: (tariff: SimTariff, category: SimCategory) => void;
  runAutopilot: (target: number) => boolean;
}

/** Strom- und Gasverträge durchrechnen. v1 hatte dafür keinen Simulator; Aufbau wie beim Telco-Warenkorb. */
export function useEnergySimulator(tariffs: TariffsByCategory): EnergySimulator {
  const basket = useSimBasket();
  const { commit, products } = basket;
  const add = useCallback(
    (tariff: SimTariff, category: SimCategory) => commit(mergeOrAdd(products, category.productCategory, tariff.name, tariff.commissionEuro)),
    [commit, products],
  );
  const runAutopilot = useCallback(
    (target: number) => {
      const next = energyAutopilot(tariffs, target);
      if (next.length === 0) return false;
      commit(next);
      return true;
    },
    [tariffs, commit],
  );
  return { basket, add, runAutopilot };
}
