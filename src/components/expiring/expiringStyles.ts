import type { Urgency } from "../../lib/expiring/expiringTypes";

/** Farbwelt je Dringlichkeit: Rot dringend, Bernstein bald, Himmelblau später (v1: Rot, Orange, Gelb). */
export const URGENCY_STYLE: Record<Urgency, { dot: string; zone: string; text: string; ring: string; chip: "red" | "amber" | "blue"; glow: string }> = {
  urgent: {
    dot: "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]",
    zone: "bg-red-500/[0.16]",
    text: "text-red-600 dark:text-red-400",
    ring: "stroke-red-500",
    chip: "red",
    glow: "rgba(244,63,94,0.42)",
  },
  medium: {
    dot: "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.75)]",
    zone: "bg-amber-500/[0.12]",
    text: "text-amber-600 dark:text-amber-400",
    ring: "stroke-amber-500",
    chip: "amber",
    glow: "rgba(245,158,11,0.38)",
  },
  low: {
    dot: "bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.7)]",
    zone: "bg-sky-500/[0.1]",
    text: "text-sky-600 dark:text-sky-400",
    ring: "stroke-sky-500",
    chip: "blue",
    glow: "rgba(56,189,248,0.36)",
  },
};

export const FACT = "flex min-w-0 items-start gap-2 text-[13px]";
export const FACT_LABEL = "block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--glass-label)]";
export const SOFT_BUTTON =
  "inline-flex h-10 items-center justify-center gap-1.5 rounded-xl px-3 text-[13px] font-semibold transition-[background-color,transform] duration-200 active:scale-[0.98] motion-reduce:transition-none";
