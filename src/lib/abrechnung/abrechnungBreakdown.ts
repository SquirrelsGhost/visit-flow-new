import { itemAmount, itemSubtitle, itemTitle, round2 } from "./abrechnungFormat";
import { viewStatus, type ViewStatus } from "./abrechnungStatus";
import type { AbrechnungCategory, AbrechnungItem } from "./abrechnungTypes";

interface FamilyRule {
  key: string;
  label: string;
  /** Farbe im Diagramm (Hex, damit SVG und Legende gleich aussehen) */
  color: string;
  match: RegExp;
}

/**
 * Produktfamilien je Kategorie. Die Abrechnung liefert nur Freitext ("1000 (1000 Mbit/s) - 80€",
 * "GigaTV Home Cable", ...), daher grob über Schlüsselwörter. Erste passende Regel gewinnt.
 */
const FAMILIES: Record<AbrechnungCategory, FamilyRule[]> = {
  vodafone: [
    { key: "glasfaser", label: "Glasfaser", color: "#10b981", match: /glasfaser|fiber|ftth/i },
    { key: "tv", label: "TV", color: "#8b5cf6", match: /tv|kas|netflix/i },
    { key: "mobile", label: "Mobilfunk", color: "#0ea5e9", match: /mobil|red |young|gigakombi|sim/i },
    { key: "upsell", label: "Upsell", color: "#f59e0b", match: /upsell|upgrade|bestand|treue/i },
    { key: "zubehoer", label: "Zubehör", color: "#f43f5e", match: /router|zubeh|station|repeater/i },
    { key: "dsl", label: "DSL", color: "#14b8a6", match: /dsl/i },
    { key: "kabel", label: "Kabel (KIP)", color: "#6366f1", match: /kabel|zuhause|cablemax|mbit|\d{2,4}/i },
  ],
  leads: [
    { key: "speicher", label: "Speicher", color: "#0ea5e9", match: /speicher|batter/i },
    { key: "waermepumpe", label: "Wärmepumpe", color: "#f43f5e", match: /w(ä|ae)rmepumpe|heiz/i },
    { key: "wallbox", label: "Wallbox", color: "#8b5cf6", match: /wallbox|lade/i },
    { key: "direkt", label: "Direkt-Lead", color: "#f59e0b", match: /direkt/i },
    { key: "pv", label: "PV-Lead", color: "#10b981", match: /pv|solar|photovoltaik|lead/i },
  ],
  energy: [
    { key: "gewerbe", label: "Gewerbe", color: "#8b5cf6", match: /gewerbe|business/i },
    { key: "gas", label: "Gas", color: "#f59e0b", match: /gas/i },
    { key: "strom", label: "Strom", color: "#0ea5e9", match: /strom|öko|oeko/i },
  ],
};

const OTHER = { key: "other", label: "Sonstiges", color: "#94a3b8" };

export function familyOf(product: string, category: AbrechnungCategory): { key: string; label: string; color: string } {
  return FAMILIES[category].find((f) => f.match.test(product)) ?? OTHER;
}

export interface FamilySlice {
  key: string;
  label: string;
  color: string;
  amount: number;
  count: number;
  share: number;
}

/** Aufteilung eines Monats nach Produktfamilie, größte zuerst. */
export function breakdown(items: readonly AbrechnungItem[], category: AbrechnungCategory): FamilySlice[] {
  const map = new Map<string, FamilySlice>();
  for (const item of items) {
    const f = familyOf(item.product, category);
    const slice = map.get(f.key) ?? { ...f, amount: 0, count: 0, share: 0 };
    slice.amount = round2(slice.amount + itemAmount(item));
    slice.count += 1;
    map.set(f.key, slice);
  }
  const total = [...map.values()].reduce((s, f) => s + f.amount, 0);
  return [...map.values()]
    .map((f) => ({ ...f, share: total > 0 ? f.amount / total : 0 }))
    .sort((a, b) => b.amount - a.amount);
}

export type SortKey = "date" | "amount";

export interface PositionFilter {
  status: ViewStatus | "all";
  family: string | null;
  query: string;
  sort: SortKey;
}

export const EMPTY_FILTER: PositionFilter = { status: "all", family: null, query: "", sort: "date" };

/** "TT.MM.JJJJ" → sortierbare Zahl JJJJMMTT */
const dateNum = (d: string) => {
  const m = d.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  return m ? Number(`${m[3]}${m[2]}${m[1]}`) : 0;
};

export function filterPositions(items: readonly AbrechnungItem[], category: AbrechnungCategory, f: PositionFilter): AbrechnungItem[] {
  const q = f.query.trim().toLowerCase();
  const hits = items.filter((item) => {
    if (f.status !== "all" && viewStatus(item) !== f.status) return false;
    if (f.family && familyOf(item.product, category).key !== f.family) return false;
    if (!q) return true;
    const hay = [itemTitle(item), itemSubtitle(item), item.webOrderId, item.contractNumber, item.customerNumber].join(" ").toLowerCase();
    return hay.includes(q);
  });
  return hits.sort((a, b) => (f.sort === "amount" ? itemAmount(b) - itemAmount(a) : dateNum(b.date) - dateNum(a.date)));
}
