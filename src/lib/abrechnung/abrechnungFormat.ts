import type { Vertical } from "../battle/battleCategories";
import type { AbrechnungCategory, AbrechnungItem, MonthRef } from "./abrechnungTypes";

export const MONTHS = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
] as const;

export const MONTHS_SHORT = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"] as const;

/** Server-Grenze für Uploads (v1 multer). */
export const MAX_FILE_BYTES = 15 * 1024 * 1024;

/** Kategorie kommt automatisch aus dem aktiven Bereich, wie in v1: Solar rechnet Leads ab, Telco die Vodafone-Provision. */
export function categoryOf(vertical: Vertical): AbrechnungCategory {
  if (vertical === "solar") return "leads";
  if (vertical === "energy") return "energy";
  return "vodafone";
}

export const monthName = (m: number) => MONTHS[((m % 12) + 12) % 12] ?? "";
export const monthLabel = ({ month, year }: MonthRef) => `${monthName(month)} ${year}`;
export const monthKey = ({ month, year }: MonthRef) => year * 12 + month;
export const fromKey = (key: number): MonthRef => ({ month: ((key % 12) + 12) % 12, year: Math.floor(key / 12) });
export const shiftMonth = (ref: MonthRef, by: number) => fromKey(monthKey(ref) + by);

export const isExcelName = (name: string | undefined) => !!name && /\.xlsx?$/i.test(name);
export const isBillingFile = (name: string) => /\.(pdf|xlsx?)$/i.test(name);

/** "1.708,50", "1708,5", "1708.50" → 1708.5. Ein Trenner mit 1–2 Ziffern dahinter ist das Komma (v1 parseAmount). */
export function parseAmount(raw: string): number {
  const s = raw.replace(/[\s€]/g, "");
  const neg = s.startsWith("-");
  const body = neg ? s.slice(1) : s;
  if (!/^\d[\d.,]*$/.test(body)) return NaN;
  const sep = Math.max(body.lastIndexOf(","), body.lastIndexOf("."));
  const n =
    sep >= 0 && body.length - sep - 1 <= 2
      ? Number(`${body.slice(0, sep).replace(/[.,]/g, "")}.${body.slice(sep + 1)}`)
      : Number(body.replace(/[.,]/g, ""));
  return neg ? -n : n;
}

/** Wofür eine Position steht: was gezahlt wurde oder was die App erwartet hat (v1 itemAmount). */
export function itemAmount(item: AbrechnungItem): number {
  if (item.status === "missing_in_system") return item.amountPdf || 0;
  if (item.status === "missing_in_pdf" || item.status === "pending") return item.amountSystem || 0;
  return item.amountPdf || item.amountSystem || 0;
}

/** Abweichung Abrechnung minus App; nur sinnvoll, wenn beide Seiten einen Betrag haben. */
export function itemDelta(item: AbrechnungItem): number | null {
  if (item.status !== "amount_mismatch") return null;
  return Math.round(((item.amountPdf || 0) - (item.amountSystem || 0)) * 100) / 100;
}

export const itemTitle = (item: AbrechnungItem) => item.street || item.customerName || item.product;
export const itemSubtitle = (item: AbrechnungItem) =>
  [item.street ? item.customerName : "", item.product].filter(Boolean).join(" · ");

export const round2 = (n: number) => Math.round(n * 100) / 100;
