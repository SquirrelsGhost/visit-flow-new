import { isExcelName, itemAmount, monthKey, MONTHS_SHORT, round2, shiftMonth } from "./abrechnungFormat";
import { STATUS_ORDER, viewStatus, type ViewStatus } from "./abrechnungStatus";
import type { AbrechnungItem, AbrechnungRecord, MonthRef } from "./abrechnungTypes";

export type SummaryTone = "ok" | "missing" | "extra";

export interface MonthSummary {
  expected: number;
  paid: number;
  diff: number;
  tone: SummaryTone;
  /** Anteil der erwarteten Summe, der ausgezahlt wurde (0–1, gekappt) */
  rate: number;
  /** Nur Summe bekannt (PDF oder ohne Datei), kein Abgleich pro Kunde */
  totalsOnly: boolean;
  counts: Record<ViewStatus, number>;
}

export function countByStatus(items: readonly AbrechnungItem[]): Record<ViewStatus, number> {
  const counts = Object.fromEntries(STATUS_ORDER.map((s) => [s, 0])) as Record<ViewStatus, number>;
  for (const item of items) counts[viewStatus(item)] += 1;
  return counts;
}

/** Soll/Ist eines Monats aus den Summen des Servers (v1 renderSummary). */
export function summarize(record: AbrechnungRecord): MonthSummary {
  const diff = record.differenceAmount;
  const tone: SummaryTone = Math.abs(diff) < 0.01 ? "ok" : diff < 0 ? "missing" : "extra";
  const expected = record.totalAmountSystem;
  const rate = expected > 0 ? Math.min(1, record.totalAmountPdf / expected) : record.totalAmountPdf > 0 ? 1 : 0;
  return {
    expected,
    paid: record.totalAmountPdf,
    diff,
    tone,
    rate,
    totalsOnly: !isExcelName(record.pdfFileName),
    counts: countByStatus(record.items),
  };
}

export interface OpenGroup {
  key: "unpaid" | "untracked" | "claimed";
  title: string;
  hint: string;
  dot: string;
  items: AbrechnungItem[];
  total: number;
}

const sum = (items: readonly AbrechnungItem[]) => round2(items.reduce((s, i) => s + itemAmount(i), 0));

/** Offene Punkte aus allen Monaten, gruppiert wie in v1. Leere Gruppen fallen weg. */
export function openGroups(open: readonly AbrechnungItem[]): OpenGroup[] {
  const unpaid = open.filter((i) => !i.reklamiert && (i.status === "missing_in_pdf" || i.status === "amount_mismatch"));
  const untracked = open.filter((i) => !i.reklamiert && i.status === "missing_in_system");
  const claimed = open.filter((i) => i.reklamiert);
  const groups: OpenGroup[] = [
    { key: "unpaid", title: "Nicht ausbezahlt", hint: "In der App getrackt, fehlt in der Abrechnung.", dot: "bg-rose-500", items: unpaid, total: sum(unpaid) },
    { key: "untracked", title: "Nicht in der App", hint: "Ausgezahlt, aber nie getrackt.", dot: "bg-amber-400", items: untracked, total: sum(untracked) },
    { key: "claimed", title: "Reklamiert", hint: "Wartet auf Klärung. Export im Reklamationen-Center.", dot: "bg-slate-400", items: claimed, total: sum(claimed) },
  ];
  return groups.filter((g) => g.items.length > 0);
}

export interface HistoryPoint extends MonthRef {
  label: string;
  expected: number;
  paid: number;
  hasRecord: boolean;
}

/** Verlauf der letzten `span` Monate bis einschließlich `end`, Monate ohne Abrechnung als leere Punkte. */
export function historySeries(records: readonly AbrechnungRecord[], end: MonthRef, span: number): HistoryPoint[] {
  const byKey = new Map(records.map((r) => [monthKey(r), r]));
  return Array.from({ length: span }, (_, i) => {
    const ref = shiftMonth(end, i - span + 1);
    const rec = byKey.get(monthKey(ref));
    return {
      ...ref,
      label: MONTHS_SHORT[ref.month] ?? "",
      expected: rec?.totalAmountSystem ?? 0,
      paid: rec?.totalAmountPdf ?? 0,
      hasRecord: !!rec,
    };
  });
}

export interface HistoryStats {
  totalPaid: number;
  average: number;
  best: HistoryPoint | null;
  /** Veränderung des gewählten Monats zum Vormonat in Prozent, null ohne Vergleich */
  trend: number | null;
}

export function historyStats(points: readonly HistoryPoint[]): HistoryStats {
  const withData = points.filter((p) => p.hasRecord);
  const totalPaid = round2(withData.reduce((s, p) => s + p.paid, 0));
  const best = withData.reduce<HistoryPoint | null>((b, p) => (!b || p.paid > b.paid ? p : b), null);
  const last = points.at(-1);
  const prev = points.at(-2);
  const trend = last?.hasRecord && prev?.hasRecord && prev.paid > 0 ? ((last.paid - prev.paid) / prev.paid) * 100 : null;
  return { totalPaid, average: withData.length ? round2(totalPaid / withData.length) : 0, best, trend };
}
