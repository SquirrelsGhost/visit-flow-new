import type { Vertical } from "../battle/battleCategories";
import { hasDemoSession } from "../auth/demoSession";
import { loadTariffs } from "../tariff/tariffApi";
import type { Tariff, TariffCategory } from "../tariff/tariffTypes";
import type { ProductCategory } from "./productMeta";
import { saleCategories, tariffsForCategory } from "./saleCatalog";

const monthly = (id: string, category: TariffCategory, name: string, price: number, extra: Partial<Tariff> = {}): Tariff => ({
  id,
  name,
  category,
  periods: [{ label: "", months: "1-24", price }],
  isActive: true,
  ...extra,
});

/** Beispieltarife für den Demo-Modus, damit der Verkauf ohne Server bedienbar ist. */
const DEMO: Tariff[] = [
  monthly("demo-kabel-250", "kabel-neu", "GigaZuhause Kabel", 39.99, { bandwidth: 250, startCredit: 100 }),
  monthly("demo-kabel-1000", "kabel-neu", "GigaZuhause Kabel", 49.99, { bandwidth: 1000 }),
  monthly("demo-glas-500", "glasfaser", "GigaZuhause Glasfaser", 44.99, { bandwidth: 500 }),
  monthly("demo-dsl-100", "dsl", "GigaZuhause DSL", 34.99, { bandwidth: 100 }),
  monthly("demo-giga-cable", "tv", "GigaTV Cable", 10),
  monthly("demo-giga-mr1", "tv", "GigaTV Home Cable Multiroom Box 1", 5, { isMultiroom: true }),
  monthly("demo-giga-mr2", "tv", "GigaTV Home Cable Multiroom Box 2", 5, { isMultiroom: true }),
  monthly("demo-paytv-sky", "tv", "Sky Entertainment", 15, { isPayTV: true }),
  monthly("demo-tv-connect", "tv", "TV Connect Standard", 5, { isKAS: true }),
  monthly("demo-basic-tv", "tv", "Basic TV", 0, { isKAS: true }),
  monthly("demo-mobil-s", "mobil", "Giga Mobil S", 29.99),
  monthly("demo-family-s", "mobil", "Family Card S", 19.99, { isFamilyCard: true }),
  monthly("demo-gigacube", "mobil", "GigaCube 5G", 39.99, { isGigaCube: true, gigaCubeHardware: { z21Monthly: 5, z22Monthly: 10 } }),
  monthly("demo-upsell-1000", "kabel-bestand", "Upsell Kabel", 49.99, { bandwidth: 1000 }),
  monthly("demo-upsell-treue", "kabel-bestand", "Treue Kabel", 39.99, { bandwidth: 500, isLoyalty: true }),
  monthly("demo-router-station", "router", "Vodafone Station", 0, { oneTimeCosts: { setup: 0 } }),
  monthly("demo-router-fritz", "router", "FRITZ!Box 6690 Cable", 0, { oneTimeCosts: { setup: 99 } }),
];

async function rawTariffs(category: TariffCategory): Promise<Tariff[]> {
  if (hasDemoSession() && category !== "strom" && category !== "gas") return DEMO.filter((t) => t.category === category);
  return loadTariffs(category);
}

/** Tarife zur Produkt-Kachel aus der Tarifverwaltung, gefiltert und sortiert wie in v1. */
export async function saleTariffs(category: ProductCategory, vertical: Vertical): Promise<Tariff[]> {
  const config = saleCategories(vertical).find((c) => c.id === category);
  const lists = await Promise.all((config?.tariffCategories ?? []).map(rawTariffs));
  return tariffsForCategory(category, lists.flat());
}
