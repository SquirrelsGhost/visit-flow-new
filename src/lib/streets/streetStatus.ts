import type { StreetStatus } from "./streetTypes";

/** v1-Status ("Angetroffen → Sale" usw.) auf die kurze Anzeige der Straßenliste abbilden (v1 displayStatus). */
export function normalizeStatus(raw: string | undefined): StreetStatus {
  const s = (raw ?? "").toLowerCase().trim();
  if (s.includes("sale")) return "sale";
  if (s.includes("versorgt")) return "versorgt";
  if (s.includes("termin")) return "termin";
  if (s.includes("kein interesse")) return "kein";
  if (s === "storno") return "storno";
  if (s === "approved") return "approved";
  return "na";
}

/** Farbe je Status wie in v1 (Verkauf grün, Termin blau, Kein Interesse rot, Versorgt lila). */
export const STATUS_TONE: Record<StreetStatus, string> = {
  sale: "bg-emerald-500/12 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300",
  termin: "bg-blue-500/10 text-blue-700 ring-blue-500/15 dark:text-blue-300",
  kein: "bg-red-500/10 text-red-600 ring-red-500/15 dark:text-red-300",
  versorgt: "bg-purple-500/10 text-purple-700 ring-purple-500/15 dark:text-purple-300",
  na: "bg-slate-900/[0.05] text-slate-600 ring-slate-900/[0.06] dark:bg-white/[0.06] dark:text-white/70 dark:ring-white/10",
  storno: "bg-rose-500/10 text-rose-700 ring-rose-500/15 dark:text-rose-300",
  approved: "bg-teal-500/10 text-teal-700 ring-teal-500/15 dark:text-teal-300",
};

export const productText = (products: readonly { category: string; quantity: number }[]) => products.map((p) => `${p.quantity} ${p.category}`).join(", ");
