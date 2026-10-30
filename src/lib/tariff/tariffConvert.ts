import type { PencilSellTariff, Tariff } from "./tariffTypes";

/**
 * Tarif aus der Verwaltung in das Pencil-Sell-Format (v1 useTariffs.convertToPencilSell):
 * 1 Periode = Flatpreis, 2 Perioden = DSL (1–12/13–24) oder Kabel/Glasfaser (1–9/10–24),
 * 3+ Perioden = erste und letzte Periode.
 */
export function toPencilSell(tariff: Tariff): PencilSellTariff {
  const result: PencilSellTariff = {
    id: tariff.id,
    name: tariff.name,
    startguthaben: tariff.startCredit || 0,
    ...(tariff.bandwidth ? { bandwidth: tariff.bandwidth } : {}),
  };
  const periods = tariff.periods ?? [];
  const [first, second] = periods;
  const last = periods[periods.length - 1];
  if (!first) return result;
  if (periods.length === 1) {
    if (tariff.category === "kabel-neu" || tariff.category === "glasfaser") {
      result.first9 = first.price;
      result.after9 = first.price;
    } else {
      result.monthly = first.price;
    }
  } else if (periods.length === 2 && second) {
    if (first.months.includes("12")) {
      result.firstA = first.price;
      result.afterA = second.price;
    } else {
      result.first9 = first.price;
      result.after9 = second.price;
    }
  } else if (last) {
    result.first9 = first.price;
    result.after9 = last.price;
  }
  return result;
}

/** Normale Tarife ohne Treuepreise. */
export const pencilSellTariffs = (tariffs: Tariff[]) => tariffs.filter((t) => !t.isLoyalty).map(toPencilSell);

/** Bereitstellung und Versand vom ersten Tarif, der welche hat (Standard 49,99 € / 9,99 €). */
export function oneTimeCosts(tariffs: Tariff[]) {
  const withCosts = tariffs.find((t) => t.oneTimeCosts);
  return {
    setup: withCosts?.oneTimeCosts?.setup || 49.99,
    shipping: withCosts?.oneTimeCosts?.shipping || 9.99,
  };
}

/** Erster und letzter Periodenpreis eines Tarifs (0, wenn er keine Perioden hat). */
export function periodPrices(tariff: Tariff): { a: number; b: number } {
  const periods = tariff.periods ?? [];
  return { a: periods[0]?.price ?? 0, b: periods[periods.length - 1]?.price ?? 0 };
}
