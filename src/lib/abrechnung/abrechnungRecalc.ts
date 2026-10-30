import { round2 } from "./abrechnungFormat";
import type { AbrechnungItem, AbrechnungRecord } from "./abrechnungTypes";

/**
 * Soll/Ist einer Abrechnung, 1:1 nach v1 recalcTotals: was die App erwartet gegen das, was die Datei zahlt.
 * Verkäufe, die mit der Abrechnung eines anderen Monats bezahlt wurden, werden dort verrechnet.
 */
export function recalcTotals(record: AbrechnungRecord): AbrechnungRecord {
  const totalAmountSystem = round2(record.items.reduce((s, i) => s + (i.crossMonthMatched ? 0 : i.amountSystem || 0), 0));
  const differenceAmount = round2((record.totalAmountPdf || 0) - totalAmountSystem);
  const openClaim = record.items.some((i) => i.reklamiert && !i.reklamationResolved);
  const status = openClaim ? "reklamiert" : Math.abs(differenceAmount) < 0.01 ? "matched" : "discrepancy";
  return { ...record, totalAmountSystem, differenceAmount, status };
}

/** Summe der Abrechnung aus ihren Zeilen (nur bei Excel bekannt). */
export function paidTotal(items: readonly AbrechnungItem[]): number {
  return round2(
    items.reduce((s, i) => {
      if (i.status === "missing_in_pdf" || i.status === "pending") return s;
      if (i.crossMonthMatched && i.soldInMonth == null) return s;
      return s + (i.amountPdf || 0);
    }, 0),
  );
}

/** Offene Positionen eines Monats, wie /unresolved/all sie liefert (mit Herkunftsmonat). */
export function unresolvedOf(record: AbrechnungRecord): AbrechnungItem[] {
  return record.items
    // 'pending' (PDF, nur die Summe ist bekannt) ist für sich nicht offen
    .filter(
      (i) =>
        !i.reklamationResolved &&
        (i.reklamiert || i.status === "missing_in_pdf" || i.status === "missing_in_system" || i.status === "amount_mismatch"),
    )
    .map((i) => ({ ...i, recordId: record._id, billingMonth: record.month, billingYear: record.year }));
}
