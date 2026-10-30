import { eur } from "../tariff/eur";
import { monthName } from "./abrechnungFormat";
import type { AbrechnungItem } from "./abrechnungTypes";

/** Abgerechneter Betrag bei Zeilen nur in der Abrechnung, sonst was die App erwartet hat (v1 amountOf). */
export const claimAmount = (i: AbrechnungItem) => (i.status === "missing_in_system" ? i.amountPdf : i.amountSystem) || 0;

const cell = (v: string) => `"${v.replace(/"/g, '""')}"`;
const num = (n?: number) => (n || 0).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const billing = (i: AbrechnungItem) => (i.billingMonth != null ? `${monthName(i.billingMonth)} ${i.billingYear}` : "");

/** CSV wie in v1: Semikolon, deutsche Zahlen und BOM, damit Excel die Umlaute liest. */
export function reklamationenCsv(items: readonly AbrechnungItem[]): string {
  const head = ["Datum", "Kunde", "Straße", "Produkt", "System(€)", "Abrechnung(€)", "Grund", "Notiz", "Abrechnungsmonat"];
  const rows = items.map((i) =>
    [
      i.date,
      cell(i.customerName || ""),
      cell(i.street || ""),
      cell(i.product || ""),
      cell(num(i.amountSystem)),
      cell(num(i.amountPdf)),
      cell(i.reklamationReason || ""),
      cell(i.reklamationNote || ""),
      billing(i),
    ].join(";"),
  );
  return "﻿" + [head.join(";"), ...rows].join("\n");
}

/** Tabulator-getrennt zum Einfügen in Mail oder Tabelle (v1 copyToClipboard). */
export const reklamationenText = (items: readonly AbrechnungItem[]) =>
  items.map((i) => [i.date, i.customerName, i.street, i.product, eur(claimAmount(i)), i.reklamationReason].join("\t")).join("\n");

/** Lädt Text als Datei herunter; ein Blob statt data:-URI, weil '#' die URI sonst abschneidet. */
export function downloadText(content: string, fileName: string, type = "text/csv;charset=utf-8"): void {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
