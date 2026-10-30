import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

interface CalcKeyProps {
  children: ReactNode;
  onPress: () => void;
  tone?: "digit" | "operator" | "equals" | "vat19" | "vat7" | "clear";
  label?: string;
  className?: string;
}

const BASE =
  "flex h-[54px] w-full select-none items-center justify-center rounded-2xl text-[17px] font-semibold leading-none tracking-[-0.01em] transition-[transform,box-shadow,background-color,filter] duration-150 active:scale-[0.93] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 sm:h-14 sm:text-lg md:h-16 touch-manipulation";

const TONES = {
  digit:
    "bg-white/75 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_2px_rgba(15,23,42,0.06)] ring-1 ring-inset ring-[var(--glass-divider)] hover:bg-white dark:bg-white/[0.06] dark:shadow-none dark:hover:bg-white/[0.1]",
  operator: "bg-[var(--glass-track)] text-foreground/80 hover:bg-[var(--glass-press)]",
  equals:
    "bg-gradient-to-b from-red-500 to-red-600 text-xl font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_10px_24px_-10px_rgba(220,38,38,0.7)] hover:brightness-110 active:scale-[0.95]",
  vat19: "gap-1 bg-blue-500/10 text-xs text-blue-700 ring-1 ring-inset ring-blue-500/15 hover:bg-blue-500/15 active:scale-[0.95] sm:text-sm md:text-base dark:text-blue-300",
  vat7: "gap-1 bg-emerald-500/10 text-xs text-emerald-700 ring-1 ring-inset ring-emerald-500/20 hover:bg-emerald-500/15 active:scale-[0.95] sm:text-sm md:text-base dark:text-emerald-300",
  clear: "bg-red-500/10 text-red-600 ring-1 ring-inset ring-red-500/20 hover:bg-red-500/15 active:scale-[0.95] dark:text-red-300",
} as const;

/** Eine Taste des Rechners im Glas-Design (Ziffer, Operator, MwSt, Löschen, Gleich). */
export default function CalcKey({ children, onPress, tone = "digit", label, className }: CalcKeyProps) {
  return (
    <button type="button" onClick={onPress} aria-label={label} className={cn(BASE, TONES[tone], className)}>
      {children}
    </button>
  );
}
