import type { Vertical } from "../battle/battleCategories";
import type { Tariff } from "../tariff/tariffTypes";
import type { DoorProduct } from "./mapTypes";
import { productMeta, type ProductCategory } from "./productMeta";
import { newId } from "./visitSync";

/** Ein Produkt im Warenkorb des Verkaufs (v1 SaleProduct). */
export interface SaleProduct {
  category: ProductCategory;
  type: string;
  quantity: number;
  details?: Record<string, string | number | boolean>;
}

/** Rückfragen nach dem Tarif-Tipp, in v1 je ein eigener Dialog. */
export type SaleQuestion = "credit" | "firstInstall" | "oldPrice" | "oldRouter" | "tvConnect" | "gigaCube";

export interface SaleAnswers {
  creditGiven?: boolean;
  firstInstall?: boolean;
  oldPrice?: string;
  oldRouter?: boolean;
  tvConnect?: boolean;
  /** Zusatz am Produktnamen, z.B. "Z21 4G (5€ mtl. / 0€ einm.)" */
  gigaCubeHardware?: string;
}

const isGigaCube = (t: Tariff) => Boolean(t.isGigaCube) || t.name.toLowerCase().includes("gigacube");

/** Reihenfolge der Rückfragen wie in v1: Startguthaben → First Install bzw. Altpreis → alter Router → TV Connect. */
export function questionsFor(tariff: Tariff): SaleQuestion[] {
  const credit: SaleQuestion[] = tariff.startCredit && tariff.startCredit > 0 ? ["credit"] : [];
  if (tariff.category === "kabel-neu") return [...credit, "firstInstall"];
  if (tariff.category === "kabel-bestand") return [...credit, "oldPrice", "oldRouter", "tvConnect"];
  if (tariff.category === "mobil" && isGigaCube(tariff)) return ["gigaCube"];
  return credit;
}

/** Altpreis prüfen wie v1 (Komma oder Punkt, 0 bis 999,99 €); null bei ungültiger Eingabe. */
export function parseOldPrice(input: string): string | null {
  const n = Number.parseFloat(input.trim().replace(",", "."));
  return Number.isNaN(n) || n < 0 || n > 999.99 ? null : n.toFixed(2);
}

function upsellGrade(tariff: Tariff, oldPrice: string): number {
  const newPrice = tariff.periods.at(-1)?.price ?? 0;
  const diff = newPrice - Number.parseFloat(oldPrice);
  if (diff >= 15) return 4;
  if (diff >= 10) return 3;
  if (diff >= 5) return 2;
  return 1;
}

/** Produktname mit allen Zusätzen, die v1 für Provision und Termine an den Namen hängt. */
export function productType(tariff: Tariff, a: SaleAnswers): string {
  let type = tariff.bandwidth ? `${tariff.name} (${tariff.bandwidth} Mbit/s)` : tariff.name;
  if (tariff.startCredit && tariff.startCredit > 0) {
    type += ` - ${tariff.startCredit}€ ${a.creditGiven ? "SG gegeben" : "SG NICHT gegeben"}`;
  }
  if (a.oldPrice) {
    const name = tariff.name.toLowerCase();
    const isGigaUpsell = tariff.category === "kabel-bestand" && name.includes("giga tv") && name.includes("upsell");
    type += isGigaUpsell ? ` (Upsell Giga Grade ${upsellGrade(tariff, a.oldPrice)}) - AP: ${a.oldPrice}€` : ` - AP: ${a.oldPrice}€`;
  }
  if (a.firstInstall) type += " - First Install";
  if (a.oldRouter) type += " - Alter Router";
  if (a.gigaCubeHardware) type += ` - ${a.gigaCubeHardware}`;
  return type;
}

const TV_CONNECT: SaleProduct = { category: "KAS", type: "TV Connect zuhause", quantity: 1 };

/**
 * Legt einen Tarif in den Warenkorb (v1 handleAddProduct).
 * TV Connect zuhause kommt bei Internet-Neukunden immer und beim Upsell auf Nachfrage dazu, aber nur einmal.
 */
export function addTariffToCart(cart: SaleProduct[], category: ProductCategory, tariff: Tariff, a: SaleAnswers = {}): SaleProduct[] {
  const next = [...cart, { category, type: productType(tariff, a), quantity: 1 }];
  const wantsTvConnect = tariff.category !== "tv" && (category === "KIP" || (category === "Upsell" && a.tvConnect === true));
  const hasTvConnect = cart.some((p) => p.category === TV_CONNECT.category && p.type === TV_CONNECT.type);
  return wantsTvConnect && !hasTvConnect ? [...next, { ...TV_CONNECT }] : next;
}

export function changeQuantity(cart: SaleProduct[], index: number, delta: number): SaleProduct[] {
  return cart.map((p, i) => (i === index ? { ...p, quantity: Math.max(1, p.quantity + delta) } : p));
}

/** "1x GigaTV, 2x Giga Mobil S" für Kommentar und Erfolgsmeldung (v1 handleSale). */
export const saleSummary = (cart: SaleProduct[]) => cart.map((p) => `${p.quantity}x ${p.type}`).join(", ");

/** Solar ohne Produkt wird wie in v1 als Direkt-Lead gespeichert. */
export const DIRECT_LEAD: SaleProduct = { category: "Solar_PV", type: "Direkt-Lead", quantity: 1 };

/** GigaCube-Hardware zur Auswahl (v1 GigaCube-Hardware-Dialog). */
export function gigaCubeOptions(tariff: Tariff): { id: string; label: string; hint?: string; suffix: string }[] {
  const hw = tariff.gigaCubeHardware ?? {};
  const z21 = `${hw.z21Monthly ?? 0}€ mtl. / ${hw.z21OneTime ?? 0}€ einm.`;
  const z22 = `${hw.z22Monthly ?? 0}€ mtl. / ${hw.z22OneTime ?? 0}€ einm.`;
  return [
    { id: "none", label: "Keine Hardware", suffix: "Ohne Hardware" },
    { id: "z21", label: "Z21 4G", hint: z21, suffix: `Z21 4G (${z21})` },
    { id: "z22", label: "Z22 5G", hint: z22, suffix: `Z22 5G (${z22})` },
  ];
}

/** Ergebnis des Verkaufs-Schritts: Warenkorb und beim Solar-Lead der Name an der Tür. */
export interface SaleResult {
  products: SaleProduct[];
  vertical: Vertical;
  doorName?: string;
  note?: string;
}

/** Warenkorb als Tür-Produkte mit Metadaten (v1 handleSale → addProduct). */
export function doorProducts(sale: SaleResult, timestamp: string): DoorProduct[] {
  return sale.products.map((p) => {
    const meta = productMeta(p.category, p.type);
    return {
      id: newId(),
      category: p.category,
      subCategory: meta.subCategory,
      type: p.type,
      quantity: p.quantity,
      isPointRelevant: meta.isPointRelevant,
      isPremium: meta.isPremium,
      vertical: sale.vertical,
      notes: sale.note || undefined,
      ...(p.details ? { details: p.details } : {}),
      timestamp,
    };
  });
}
