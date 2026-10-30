import { HSI_GRADES, KIP_KEYS, TV_CONNECT, type SimCategory } from "./simulatorCatalog";
import type { SimProduct, SimTariff, TariffsByCategory } from "./simulatorTypes";

let nextId = 0;
const newId = () => `p${Date.now().toString(36)}-${(nextId++).toString(36)}`;

/** Gleicher Tarif in gleicher Kategorie erhöht die Menge, sonst kommt ein neuer Posten dazu. */
export function mergeOrAdd(products: readonly SimProduct[], category: string, name: string, commission: number, quantity = 1): SimProduct[] {
  const existing = products.find((p) => p.name === name && p.category === category);
  if (existing) return products.map((p) => (p === existing ? { ...p, quantity: p.quantity + quantity } : p));
  return [...products, { id: newId(), category, name, quantity, commission }];
}

/**
 * Tarif in den Warenkorb wie v1 addProduct: "Giga TV"-Tarife zählen als GigaTV (bonusrelevant), der Rest im
 * TV-Reiter als KAS. Zu jedem Neuvertrag (Kabel, Glasfaser, DSL) kommt "TV Connect zuhause" als KAS dazu.
 */
export function addTelcoTariff(products: readonly SimProduct[], tariff: SimTariff, category: SimCategory, all: TariffsByCategory): SimProduct[] {
  let productCategory = category.productCategory;
  if (productCategory === "KAS" && tariff.name.toLowerCase().includes("giga tv")) productCategory = "GigaTV";
  let next = mergeOrAdd(products, productCategory, tariff.name, tariff.commissionEuro);
  if (KIP_KEYS.includes(category.key)) {
    const tvConnect = (all.tv ?? []).find((t) => t.name.toLowerCase().includes(TV_CONNECT.toLowerCase()));
    next = mergeOrAdd(next, "KAS", TV_CONNECT, tvConnect?.commissionEuro ?? 0);
  }
  return next;
}

/** Menge ändern; bei 0 fällt der Posten heraus. */
export function changeQuantity(products: readonly SimProduct[], id: string, delta: number): SimProduct[] {
  return products.map((p) => (p.id === id ? { ...p, quantity: Math.max(0, p.quantity + delta) } : p)).filter((p) => p.quantity > 0);
}

/**
 * Tarife eines Reiters: Upsell zeigt die festen HSI-Grades plus Winback-Tarife aus der Verwaltung,
 * alle anderen nach Bandbreite, sonst nach Provision absteigend (v1 currentTariffs).
 */
export function tariffsFor(key: string, all: TariffsByCategory): SimTariff[] {
  const list = [...(all[key] ?? [])];
  const byCommission = (a: SimTariff, b: SimTariff) => b.commissionEuro - a.commissionEuro;
  if (key === "kabel-bestand") return [...HSI_GRADES, ...list.filter((t) => t.name.toLowerCase().includes("winback")).sort(byCommission)];
  return list.sort((a, b) => (a.bandwidth && b.bandwidth ? b.bandwidth - a.bandwidth : byCommission(a, b)));
}

export const unitCount = (products: readonly SimProduct[]) => products.reduce((sum, p) => sum + p.quantity, 0);
export const baseTotal = (products: readonly SimProduct[]) => products.reduce((sum, p) => sum + p.commission * p.quantity, 0);
