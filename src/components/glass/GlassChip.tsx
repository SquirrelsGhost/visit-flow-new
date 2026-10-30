import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

type GlassChipTone = "red" | "slate" | "amber" | "green" | "blue";

interface GlassChipProps {
  tone?: GlassChipTone;
  /** Auf einer tiefen, dunklen Karte heller und mit Glaskante. */
  onDeep?: boolean;
  children: ReactNode;
}

const ON_GLASS: Record<GlassChipTone, string> = {
  red: "bg-red-500/10 text-red-600 ring-red-500/15 dark:text-red-300",
  slate: "bg-slate-900/[0.05] text-slate-600 ring-slate-900/[0.06] dark:bg-white/[0.06] dark:text-white/75 dark:ring-white/10",
  amber: "bg-amber-500/15 text-amber-700 ring-amber-500/20 dark:text-amber-300",
  green: "bg-emerald-500/12 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300",
  blue: "bg-blue-500/10 text-blue-700 ring-blue-500/15 dark:text-blue-300",
};

const ON_DEEP: Record<GlassChipTone, string> = {
  red: "bg-red-500/20 text-red-100 ring-red-300/25",
  slate: "bg-white/[0.08] text-white/85 ring-white/15",
  amber: "bg-amber-400/15 text-amber-200 ring-amber-300/25",
  green: "bg-emerald-400/15 text-emerald-200 ring-emerald-300/25",
  blue: "bg-sky-400/15 text-sky-200 ring-sky-300/25",
};

/** Kleine Plakette (Rolle, Team, Status) mit feiner Glaskante. */
export default function GlassChip({ tone = "slate", onDeep = false, children }: GlassChipProps) {
  return (
    <span className={cn("inline-flex max-w-full items-center gap-1 truncate rounded-full px-2.5 py-1 text-[12px] font-semibold ring-1 ring-inset", onDeep ? ON_DEEP[tone] : ON_GLASS[tone])}>
      {children}
    </span>
  );
}
