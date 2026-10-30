import { demoRecords, demoSales, matchSales, totalsOnly } from "./abrechnungDemoData";
import { isExcelName, monthKey } from "./abrechnungFormat";
import { recalcTotals, unresolvedOf } from "./abrechnungRecalc";
import type { AbrechnungCategory, AbrechnungItem, AbrechnungRecord, MonthRef, UploadResult } from "./abrechnungTypes";

/**
 * Demo-Abrechnungen, nur im Speicher des Tabs. Ältere Monate sind "abgearbeitet":
 * fehlende Verkäufe kamen mit der Folgeabrechnung, Abweichungen wurden reklamiert und geklärt.
 */
const stores = new Map<AbrechnungCategory, AbrechnungRecord[]>();
let clock = () => new Date();

/** Nur für Tests: fester "Heute"-Tag, setzt alle Demo-Daten zurück. */
export function resetDemoAbrechnung(now?: Date): void {
  stores.clear();
  clock = now ? () => now : () => new Date();
}

function settle(records: AbrechnungRecord[]): AbrechnungRecord[] {
  const out = records.map((r) => ({ ...r, items: r.items.map((i) => ({ ...i })) }));
  out.forEach((rec, idx) => {
    const age = out.length - idx;
    const next = out[idx + 1];
    for (const item of rec.items) {
      if (age > 3 && item.status === "missing_in_pdf" && next && isExcelName(next.pdfFileName)) {
        Object.assign(item, { status: "cross_matched", crossMonthMatched: true, amountPdf: item.amountSystem, paidInMonth: next.month, paidInYear: next.year });
        next.items.push({ ...item, _id: `${item._id}-x`, crossMonthMatched: false, soldInMonth: rec.month, soldInYear: rec.year, paidInMonth: undefined, paidInYear: undefined });
        next.totalAmountPdf += item.amountSystem;
      } else if (age > 3 && item.status === "missing_in_system") {
        Object.assign(item, { status: "matched", amountSystem: item.amountPdf });
      } else if (age > 2 && item.status === "amount_mismatch") {
        Object.assign(item, { reklamiert: true, reklamationReason: "Falscher Betrag", reklamationResolved: true });
      }
    }
  });
  // Zwei frische Reklamationen im Vormonat
  const last = out.at(-1);
  last?.items.filter((i) => i.status === "missing_in_pdf").slice(0, 2).forEach((i, n) => {
    Object.assign(i, { reklamiert: true, reklamationReason: n ? "Wurde nicht bezahlt" : "Nicht abgerechnet", reklamationNote: n ? "" : "Vertrag aktiviert, Router geliefert", reklamationDate: new Date(last.year, last.month + 1, 3 + n).toISOString(), reklamationResolved: false });
  });
  return out.map(recalcTotals);
}

function records(category: AbrechnungCategory): AbrechnungRecord[] {
  let list = stores.get(category);
  if (!list) {
    list = settle(demoRecords(category, clock()));
    stores.set(category, list);
  }
  return list;
}

const save = (category: AbrechnungCategory, list: AbrechnungRecord[]) => stores.set(category, list.map(recalcTotals));
const sameMonth = (r: AbrechnungRecord, ref: MonthRef) => r.month === ref.month && r.year === ref.year;

export const demoDelay = (ms = 280) => new Promise((resolve) => setTimeout(resolve, ms));

export const demoRecord = (category: AbrechnungCategory, ref: MonthRef) => records(category).find((r) => sameMonth(r, ref)) ?? null;

export const demoHistory = (category: AbrechnungCategory) => records(category);

export function demoOpen(category: AbrechnungCategory): AbrechnungItem[] {
  return records(category).flatMap(unresolvedOf).sort((a, b) => (b.billingYear! - a.billingYear!) * 12 + (b.billingMonth! - a.billingMonth!));
}

export function demoReklamationen(category: AbrechnungCategory): AbrechnungItem[] {
  return demoOpen(category).filter((i) => i.reklamiert);
}

export function demoUpload(category: AbrechnungCategory, ref: MonthRef, fileName: string | null, total?: number): UploadResult {
  const sales = demoSales(category, ref, clock());
  const record = fileName && isExcelName(fileName)
    ? matchSales(category, ref, sales, { missing: 0.12, mismatch: 0.05, untracked: 2 }, Date.now() % 997)
    : totalsOnly(category, ref, sales, total ?? 0, fileName ?? undefined);
  save(category, [...records(category).filter((r) => !sameMonth(r, ref)), record].sort((a, b) => monthKey(a) - monthKey(b)));
  return { record: demoRecord(category, ref)!, parsedItemCount: record.items.filter((i) => i.status !== "missing_in_pdf").length };
}

export function demoDeleteRecord(category: AbrechnungCategory, id: string): void {
  save(category, records(category).filter((r) => r._id !== id));
}

type ItemPatch = (item: AbrechnungItem) => AbrechnungItem | null;

/** Wendet eine Änderung auf Positionen an, egal in welchem Monat sie liegen; null entfernt die Position. */
export function demoPatchItems(category: AbrechnungCategory, ids: readonly string[], patch: ItemPatch): void {
  const wanted = new Set(ids);
  save(
    category,
    records(category).map((r) => ({
      ...r,
      items: r.items.flatMap((i) => {
        if (!wanted.has(i._id)) return [i];
        const next = patch({ ...i });
        return next ? [next] : [];
      }),
    })),
  );
}
