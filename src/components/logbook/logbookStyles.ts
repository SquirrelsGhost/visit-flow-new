import type { TripKind } from "../../lib/logbook/logbookTypes";
import type { GlassTone } from "../../lib/glass/glassTones";

/** Farbwelt je Fahrtart: Dienst blau, Arbeitsweg bernstein, privat violett. Rot bleibt den Aktionen vorbehalten. */
export const KIND_STYLE: Record<TripKind, { bar: string; dot: string; text: string; chip: "blue" | "amber" | "slate"; tone: GlassTone }> = {
  business: { bar: "bg-gradient-to-r from-sky-400 to-blue-500", dot: "bg-blue-500", text: "text-blue-600 dark:text-sky-300", chip: "blue", tone: "blue" },
  commute: { bar: "bg-gradient-to-r from-yellow-300 to-amber-500", dot: "bg-amber-500", text: "text-amber-600 dark:text-amber-300", chip: "amber", tone: "amber" },
  private: { bar: "bg-gradient-to-r from-fuchsia-400 to-purple-500", dot: "bg-purple-500", text: "text-purple-600 dark:text-fuchsia-300", chip: "slate", tone: "purple" },
};

/** Balkenfarben im Tagesdiagramm (SVG/Divs ohne Verlauf, damit dünne Balken klar bleiben). */
export const KIND_FILL: Record<TripKind, string> = {
  business: "bg-sky-400",
  commute: "bg-amber-400",
  private: "bg-fuchsia-400",
};

export const FACT = "flex min-w-0 items-start gap-2 text-[13px]";
export const FACT_LABEL = "block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--glass-label)]";
export const SOFT_BUTTON =
  "inline-flex h-10 items-center justify-center gap-1.5 rounded-xl px-3 text-[13px] font-semibold transition-[background-color,transform] duration-200 active:scale-[0.98] disabled:opacity-50 motion-reduce:transition-none";
export const SOFT_NEUTRAL = "bg-slate-900/[0.05] text-foreground hover:bg-slate-900/[0.08] dark:bg-white/[0.06] dark:hover:bg-white/[0.1]";
export const FIELD_LABEL = "mb-1.5 block px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--glass-label)]";
