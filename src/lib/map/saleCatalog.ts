import type { Vertical } from "../battle/battleCategories";
import type { Tariff, TariffCategory } from "../tariff/tariffTypes";
import type { ProductCategory } from "./productMeta";

export interface SaleCategory {
  id: ProductCategory;
  label: string;
  /** Emoji wie die übrigen Kacheln im Sheet */
  icon: string;
  color: string;
  tariffCategories: TariffCategory[];
}

/** Produkt-Kacheln je Branche (v1 SaleDialog PRODUCT_CATEGORIES). Solar erfasst in v1 nur einen Lead. */
export function saleCategories(vertical: Vertical): SaleCategory[] {
  if (vertical === "solar") return [];
  if (vertical === "energy") {
    return [
      { id: "Strom", label: "Strom", icon: "⚡", color: "#eab308", tariffCategories: ["strom"] },
      { id: "Gas", label: "Gas", icon: "🔥", color: "#f97316", tariffCategories: ["gas"] },
    ];
  }
  return [
    { id: "KIP", label: "Internet", icon: "📶", color: "#3b82f6", tariffCategories: ["kabel-neu", "glasfaser", "dsl"] },
    { id: "GigaTV", label: "GigaTV", icon: "📺", color: "#ef4444", tariffCategories: ["tv"] },
    { id: "KAS", label: "KAS", icon: "📡", color: "#22c55e", tariffCategories: ["tv"] },
    { id: "Mobile", label: "Mobilfunk", icon: "📱", color: "#f97316", tariffCategories: ["mobil"] },
    { id: "Upsell", label: "Upsell", icon: "📈", color: "#eab308", tariffCategories: ["kabel-bestand"] },
    { id: "Zubehör", label: "Zubehör", icon: "📦", color: "#64748b", tariffCategories: ["router"] },
  ];
}

export interface SaleTab {
  id: string;
  label: string;
  match: (t: Tariff) => boolean;
}

const lower = (t: Tariff) => t.name.toLowerCase();
const isGigaCube = (t: Tariff) => Boolean(t.isGigaCube) || lower(t).includes("gigacube");
const isFamily = (t: Tariff) => Boolean(t.isFamilyCard) || t.name.includes("Family Card");
const isKasTariff = (t: Tariff) =>
  Boolean(t.isKAS) || t.name.includes("TV Connect") || t.name.includes("Basic TV") || t.name === "GigaTV Mobile-App";

/** Reiter innerhalb einer Kategorie (v1 Internet-, Upsell- und Mobil-Unterkategorien). */
export function saleTabs(category: ProductCategory): SaleTab[] {
  if (category === "KIP") {
    return [
      { id: "kabel", label: "Kabel", match: (t) => t.category === "kabel-neu" },
      { id: "glasfaser", label: "Glasfaser", match: (t) => t.category === "glasfaser" },
      { id: "dsl", label: "DSL", match: (t) => t.category === "dsl" },
    ];
  }
  if (category === "Upsell") {
    const plain = (t: Tariff) => !["winback", "treue", "giga tv"].some((w) => lower(t).includes(w));
    return [
      { id: "normal", label: "Normal", match: plain },
      { id: "treue", label: "Treue", match: (t) => lower(t).includes("treue") },
      { id: "winback", label: "Winback", match: (t) => lower(t).includes("winback") },
      { id: "giga", label: "GigaTV", match: (t) => lower(t).includes("giga tv") },
    ];
  }
  if (category === "Mobile") {
    return [
      { id: "normal", label: "Normal", match: (t) => !isFamily(t) && !isGigaCube(t) },
      { id: "familyCard", label: "FamilyCard", match: isFamily },
      { id: "gigaCube", label: "GigaCube", match: isGigaCube },
    ];
  }
  return [];
}

const ROUTER_ORDER = ["Vodafone Station", "Ultra Hub 7", "FRITZ!Box 6670 Cable", "FRITZ!Box 6690 Cable", "FRITZ!Box 5590 Fiber",
  "FRITZ!Box 5530 Fiber", "FRITZ!Box 7590 AX", "FRITZ!Box 7530 AX", "FRITZ!Box 6591", "FRITZ!Box 6690", "FRITZ!Box 6670",
  "FRITZ!Box 5690", "FRITZ!Box 5530"];
const GIGA_ORDER = ["GigaTV Sound", "Giga TV Home Cable", "GigaTV Cable", "GigaTV Premium", "GigaTV Netflix", "GigaTV App", "GigaTV Mobile"];
const KAS_ORDER = ["TV Connect", "Basic TV"];

const rank = (order: string[], name: string) => {
  const i = order.findIndex((o) => name.includes(o));
  return i === -1 ? 999 : i;
};
const price = (t: Tariff) => t.periods[0]?.price ?? 0;

function compare(category: ProductCategory, a: Tariff, b: Tariff): number {
  if (category === "KIP" || category === "Upsell") {
    if (a.bandwidth && b.bandwidth) return a.bandwidth - b.bandwidth;
    return a.bandwidth ? -1 : b.bandwidth ? 1 : 0;
  }
  if (category === "Zubehör") return rank(ROUTER_ORDER, a.name) - rank(ROUTER_ORDER, b.name) || a.name.localeCompare(b.name);
  if (category === "GigaTV") return rank(GIGA_ORDER, a.name) - rank(GIGA_ORDER, b.name) || price(a) - price(b);
  if (category === "KAS") return rank(KAS_ORDER, a.name) - rank(KAS_ORDER, b.name) || price(a) - price(b);
  if (category === "Mobile") return price(a) - price(b);
  return 0;
}

/** Welche Tarife eine Kategorie zeigt und in welcher Reihenfolge (v1 loadTariffs + sortTariffs). */
export function tariffsForCategory(category: ProductCategory, all: Tariff[]): Tariff[] {
  let list = category === "Upsell" || category === "Mobile" ? all : all.filter((t) => !t.isLoyalty && !t.isWinback);
  if (category === "GigaTV") list = list.filter((t) => !isKasTariff(t));
  if (category === "KAS") list = list.filter(isKasTariff);
  return [...list].sort((a, b) => compare(category, a, b));
}
