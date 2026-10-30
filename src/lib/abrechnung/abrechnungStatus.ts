import type { AbrechnungItem } from "./abrechnungTypes";

/**
 * Was eine Position für den Berater bedeutet. Fasst die v1-Zustände zusammen:
 * matched + cross_matched = ausgezahlt, missing_in_pdf + pending = offen.
 */
export type ViewStatus = "paid" | "open" | "mismatch" | "untracked" | "claimed";

export function viewStatus(item: AbrechnungItem): ViewStatus {
  if (item.reklamiert && !item.reklamationResolved) return "claimed";
  if (item.status === "matched" || item.status === "cross_matched") return "paid";
  if (item.status === "amount_mismatch") return "mismatch";
  if (item.status === "missing_in_system") return "untracked";
  return "open";
}

export interface StatusMeta {
  label: string;
  hint: string;
  /** Punkt vor dem Namen */
  dot: string;
  /** Kleiner Chip in der Zeile */
  chip: string;
}

export const STATUS_ORDER: readonly ViewStatus[] = ["paid", "open", "mismatch", "untracked", "claimed"];

export const STATUS_META: Record<ViewStatus, StatusMeta> = {
  paid: {
    label: "Ausgezahlt",
    hint: "Getrackt und ausgezahlt",
    dot: "bg-emerald-500",
    chip: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300",
  },
  open: {
    label: "Offen",
    hint: "In der App getrackt, noch nicht ausgezahlt",
    dot: "bg-rose-500",
    chip: "bg-rose-500/10 text-rose-700 ring-rose-500/20 dark:text-rose-300",
  },
  mismatch: {
    label: "Abweichung",
    hint: "Ausgezahlt, aber mit anderem Betrag",
    dot: "bg-orange-500",
    chip: "bg-orange-500/10 text-orange-700 ring-orange-500/20 dark:text-orange-300",
  },
  untracked: {
    label: "Nicht in der App",
    hint: "Ausgezahlt, aber nie getrackt",
    dot: "bg-amber-400",
    chip: "bg-amber-400/15 text-amber-800 ring-amber-500/20 dark:text-amber-300",
  },
  claimed: {
    label: "Reklamiert",
    hint: "Wartet auf Klärung",
    dot: "bg-slate-400",
    chip: "bg-slate-500/10 text-slate-700 ring-slate-500/20 dark:text-slate-300",
  },
};

/** Gründe wie in v1, in dieser Reihenfolge. */
export const REKLAMATION_REASONS = [
  "Wurde nicht bezahlt",
  "Nicht abgerechnet",
  "Falscher Betrag",
  "Storno ungerechtfertigt",
  "Produkt fehlt",
  "Doppelte Abrechnung",
  "Sonstiges",
] as const;

/** Vorschlag beim Öffnen: nur getrackte, nicht ausgezahlte Positionen sind klar "Nicht abgerechnet" (v1). */
export function suggestedReason(items: readonly AbrechnungItem[]): string {
  if (items.length && items.every((i) => i.status === "missing_in_pdf" || i.status === "pending")) return "Nicht abgerechnet";
  if (items.length && items.every((i) => i.status === "amount_mismatch")) return "Falscher Betrag";
  return "";
}
