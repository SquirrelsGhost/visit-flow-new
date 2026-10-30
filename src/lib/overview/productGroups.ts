import { Battery, Cable, Car, Flame, Headphones, Home, Smartphone, Sun, ThermometerSun, TrendingUp, Tv, Wifi, Zap, type LucideIcon } from "lucide-react";
import type { Vertical } from "../battle/battleCategories";
import type { GlassTone } from "../glass/glassTones";
import type { ProductCategory } from "../map/productMeta";

interface ProductGroupMeta {
  label: string;
  icon: LucideIcon;
  tone: GlassTone;
}

/** Produktgruppen je Sparte, Reihenfolge wie in v1 (DailyStatsCards bzw. Battle-Punkte). */
const GROUPS: Record<Vertical, readonly ProductCategory[]> = {
  telco: ["KIP", "Glasfaser", "GigaTV", "KAS", "Mobile", "Upsell", "Zubehör"],
  energy: ["Strom", "Gas"],
  solar: ["Solar_PV", "Solar_Miete", "Speicher", "Waermepumpe", "Wallbox"],
};

/** Name, Symbol und Farbe je Gruppe; Farben wie die v1-Kacheln. */
export const PRODUCT_GROUP_META: Partial<Record<ProductCategory, ProductGroupMeta>> = {
  KIP: { label: "KIP", icon: Wifi, tone: "blue" },
  Glasfaser: { label: "Glasfaser", icon: Cable, tone: "indigo" },
  GigaTV: { label: "GigaTV", icon: Tv, tone: "red" },
  KAS: { label: "KAS", icon: Tv, tone: "purple" },
  Mobile: { label: "Mobilfunk", icon: Smartphone, tone: "orange" },
  Upsell: { label: "Upsell", icon: TrendingUp, tone: "amber" },
  "Zubehör": { label: "Zubehör", icon: Headphones, tone: "gray" },
  Strom: { label: "Strom", icon: Zap, tone: "amber" },
  Gas: { label: "Gas", icon: Flame, tone: "orange" },
  Solar_PV: { label: "PV-Kauf", icon: Sun, tone: "amber" },
  Solar_Miete: { label: "PV-Miete", icon: Home, tone: "green" },
  Speicher: { label: "Speicher", icon: Battery, tone: "blue" },
  Waermepumpe: { label: "Wärmepumpe", icon: ThermometerSun, tone: "rose" },
  Wallbox: { label: "Wallbox", icon: Car, tone: "indigo" },
};

export function productGroupsFor(vertical: Vertical): readonly ProductCategory[] {
  return GROUPS[vertical];
}

/** Anzeigename einer Kategorie (Ziele im Gewinnspiel, Teamzahlen). */
export function categoryLabel(category: string): string {
  return PRODUCT_GROUP_META[category as ProductCategory]?.label ?? category;
}
