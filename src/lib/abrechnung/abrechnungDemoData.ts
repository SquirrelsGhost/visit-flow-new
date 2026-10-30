import {
  DEMO_CITIES,
  DEMO_FILE,
  DEMO_NAMES,
  DEMO_PRODUCTS,
  DEMO_STREETS,
  DEMO_VOLUME,
  pick,
  pickWeighted,
  seeded,
} from "./abrechnungDemoCatalog";
import { MONTHS, monthKey, round2, shiftMonth } from "./abrechnungFormat";
import { paidTotal, recalcTotals } from "./abrechnungRecalc";
import type { AbrechnungCategory, AbrechnungItem, AbrechnungRecord, MonthRef } from "./abrechnungTypes";

const pad = (n: number) => String(n).padStart(2, "0");
const digits = (rnd: () => number, n: number) => Array.from({ length: n }, () => Math.floor(rnd() * 10)).join("");
const SEED: Record<AbrechnungCategory, number> = { vodafone: 11, leads: 23, energy: 37 };

/** Getrackte Verkäufe eines Monats, so wie die App sie kennt (v1 buildSystemItems). */
export function demoSales(category: AbrechnungCategory, ref: MonthRef, today: Date): AbrechnungItem[] {
  const rnd = seeded(SEED[category] * 1000 + monthKey(ref));
  const [min, max] = DEMO_VOLUME[category];
  const isCurrent = ref.year === today.getFullYear() && ref.month === today.getMonth();
  const lastDay = isCurrent ? Math.max(1, today.getDate() - 1) : new Date(ref.year, ref.month + 1, 0).getDate();
  const count = Math.round((min + rnd() * (max - min)) * (lastDay / 30));
  return Array.from({ length: count }, (_, i) => {
    const product = pickWeighted(rnd, DEMO_PRODUCTS[category]);
    const place = pick(rnd, DEMO_CITIES);
    return {
      _id: `${category}-${monthKey(ref)}-s${i}`,
      date: `${pad(1 + Math.floor(rnd() * lastDay))}.${pad(ref.month + 1)}.${ref.year}`,
      street: `${pick(rnd, DEMO_STREETS)} ${1 + Math.floor(rnd() * 80)}`,
      customerName: pick(rnd, DEMO_NAMES),
      product: product.name,
      amountSystem: product.amount,
      amountPdf: 0,
      status: "missing_in_pdf" as const,
      reklamiert: false,
      zipCode: place.zip,
      city: place.city,
      ...(category === "vodafone" ? { webOrderId: digits(rnd, 9) } : {}),
    };
  });
}

/** Zeile, die nur in der Abrechnung steht (nie getrackt). */
function untrackedRow(category: AbrechnungCategory, ref: MonthRef, rnd: () => number, n: number): AbrechnungItem {
  const product = pickWeighted(rnd, DEMO_PRODUCTS[category]);
  return {
    _id: `${category}-${monthKey(ref)}-u${n}`,
    date: `${pad(1 + Math.floor(rnd() * 27))}.${pad(ref.month + 1)}.${ref.year}`,
    street: `${pick(rnd, DEMO_STREETS)} ${1 + Math.floor(rnd() * 80)}`,
    customerName: pick(rnd, DEMO_NAMES),
    product: product.name,
    amountSystem: 0,
    amountPdf: product.amount,
    status: "missing_in_system",
    reklamiert: false,
    contractNumber: digits(rnd, 10),
    ...(category === "vodafone" ? { webOrderId: digits(rnd, 9) } : {}),
  };
}

export interface MatchOptions {
  /** Anteil, der in der Abrechnung fehlt */
  missing: number;
  /** Anteil mit falschem Betrag */
  mismatch: number;
  untracked: number;
}

/** Simulierter Abgleich einer Excel-Abrechnung gegen die getrackten Verkäufe. */
export function matchSales(category: AbrechnungCategory, ref: MonthRef, sales: AbrechnungItem[], opts: MatchOptions, salt = 0): AbrechnungRecord {
  const rnd = seeded(SEED[category] * 7919 + monthKey(ref) + salt);
  const items: AbrechnungItem[] = sales.map((s) => {
    const roll = rnd();
    const paperwork = { customerNumber: digits(rnd, 9), contractNumber: digits(rnd, 10) };
    if (roll < opts.missing) return { ...s };
    if (roll < opts.missing + opts.mismatch) {
      const cut = Math.max(5, Math.round((s.amountSystem * (0.15 + rnd() * 0.3)) / 5) * 5);
      return { ...s, ...paperwork, status: "amount_mismatch", amountPdf: round2(s.amountSystem - cut) };
    }
    return { ...s, ...paperwork, status: "matched", amountPdf: s.amountSystem };
  });
  for (let n = 0; n < opts.untracked; n++) items.push(untrackedRow(category, ref, rnd, n));
  const record: AbrechnungRecord = {
    _id: `${category}-rec-${monthKey(ref)}`,
    month: ref.month,
    year: ref.year,
    category,
    pdfFileName: `${DEMO_FILE[category]}_${MONTHS[ref.month]}_${ref.year}.xlsx`,
    totalAmountPdf: paidTotal(items),
    totalAmountSystem: 0,
    differenceAmount: 0,
    status: "pending",
    items,
  };
  return recalcTotals(record);
}

/** Abrechnung nur mit Summe (PDF): kein Einzelabgleich, alle Verkäufe "pending". */
export function totalsOnly(category: AbrechnungCategory, ref: MonthRef, sales: AbrechnungItem[], total: number, fileName?: string): AbrechnungRecord {
  return recalcTotals({
    _id: `${category}-rec-${monthKey(ref)}`,
    month: ref.month,
    year: ref.year,
    category,
    pdfFileName: fileName,
    totalAmountPdf: round2(total),
    totalAmountSystem: 0,
    differenceAmount: 0,
    status: "pending",
    items: sales.map((s) => ({ ...s, status: "pending" as const })),
  });
}

/** Zwölf Monate Historie bis zum Vormonat; der laufende Monat hat noch keine Abrechnung. */
export function demoRecords(category: AbrechnungCategory, today: Date): AbrechnungRecord[] {
  const current = { month: today.getMonth(), year: today.getFullYear() };
  const records: AbrechnungRecord[] = [];
  for (let back = 12; back >= 1; back--) {
    const ref = shiftMonth(current, -back);
    const sales = demoSales(category, ref, today);
    if (back === 5) {
      const total = sales.reduce((s, i) => s + i.amountSystem, 0) * 0.96;
      records.push(totalsOnly(category, ref, sales, total, `${DEMO_FILE[category]}_${MONTHS[ref.month]}_${ref.year}.pdf`));
      continue;
    }
    const recent = back <= 3;
    records.push(matchSales(category, ref, sales, { missing: recent ? 0.1 : 0.05, mismatch: recent ? 0.06 : 0.03, untracked: recent ? 2 : 1 }));
  }
  return records;
}
