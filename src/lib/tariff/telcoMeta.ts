import { FALLBACK_TARIFFS } from "./telcoCatalog";
import { pencilSellTariffs } from "./tariffConvert";
import type { PencilSellTariff, Tariff, TariffCategory } from "./tariffTypes";
import type { MetaTariff, Portfolio, TelcoMeta } from "./telcoTypes";

export type InternetCategory = "kabel-neu" | "kabel-bestand" | "glasfaser" | "dsl";

/** Upsell rechnet mit den Bestandskunden-Tarifen. */
export const portfolioToCategory = (p: Portfolio): InternetCategory => (p === "kabel-upsell" ? "kabel-bestand" : p);

/** Internet-Tarife aus der Verwaltung, sonst die eingebauten Standardtarife. */
export function internetTariffs(portfolio: Portfolio, tariffs: Tariff[]): PencilSellTariff[] {
  const fromService = pencilSellTariffs(tariffs);
  if (fromService.length > 0) return fromService;
  const fallback: PencilSellTariff[] = FALLBACK_TARIFFS[portfolioToCategory(portfolio)];
  return fallback.map((t) => ({ ...t, startguthaben: t.startguthaben || 0 }));
}

const row = (t: PencilSellTariff, a6: number | undefined, a79: number | undefined, b: number | undefined, credit = 0): MetaTariff => ({
  id: t.id,
  name: t.name,
  a6: a6 ?? 0,
  a79: a79 ?? 0,
  b: b ?? 0,
  credit,
});

/**
 * Laufzeit-Abschnitte je Portfolio (v1 meta):
 * Kabel Neu und Glasfaser 1–6 / 7–9 / 10–24, DSL 1–12 / 13–24, Upsell 1–6 / 7–24.
 */
export function buildMeta(portfolio: Portfolio, loaded: PencilSellTariff[], setupCost: number): TelcoMeta {
  if (portfolio === "kabel-neu") {
    return {
      title: "Kabel (Neukunden)",
      ...{ months6: 6, label6: "1.–6. Monat", months79: 3, label79: "7.–9. Monat", monthsB: 15, labelB: "10.–24. Monat" },
      oneOffs: setupCost,
      tariffs: loaded.map((t) => row(t, t.first6 ?? t.first9, t.sevenToNine ?? t.first9, t.after9, t.startguthaben ?? 0)),
    };
  }
  if (portfolio === "glasfaser") {
    return {
      title: "Glasfaser",
      ...{ months6: 6, label6: "1.–6. Monat", months79: 3, label79: "7.–9. Monat", monthsB: 15, labelB: "10.–24. Monat" },
      oneOffs: setupCost,
      tariffs: loaded.map((t) => row(t, t.first9, t.first9, t.after9)),
    };
  }
  if (portfolio === "dsl") {
    return {
      title: "DSL",
      ...{ months6: 12, label6: "1.–12. Monat", months79: 0, label79: "", monthsB: 12, labelB: "13.–24. Monat" },
      oneOffs: 0,
      tariffs: loaded.map((t) => row(t, t.firstA, 0, t.afterA)),
    };
  }
  return {
    title: "Kabel (Upsell)",
    ...{ months6: 6, label6: "1.–6. Monat", months79: 0, label79: "", monthsB: 18, labelB: "7.–24. Monat" },
    oneOffs: 0,
    tariffs: loaded.map((t) => row(t, t.monthly, 0, t.monthly)),
  };
}

export const ADDON_CATEGORIES: TariffCategory[] = ["mobil", "tv", "kabel-bestand", "router"];
