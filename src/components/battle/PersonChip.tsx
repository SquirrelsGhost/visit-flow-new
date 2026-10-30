import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { initial } from "./battleStyles";

interface PersonChipProps {
  name: string;
  tone: "gray" | "amber";
  onClick?: () => void;
  title?: string;
  children?: ReactNode;
}

const TONES = {
  gray: {
    chip: "bg-[var(--glass-track)] text-slate-600 dark:text-white/65",
    hover: "hover:bg-slate-900/10 dark:hover:bg-white/15",
    dot: "bg-slate-400/80 text-white dark:bg-white/20",
  },
  amber: {
    chip: "bg-amber-500/12 text-amber-800 ring-1 ring-inset ring-amber-500/20 dark:text-amber-200",
    hover: "",
    dot: "bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950",
  },
} as const;

/** Runde Namensmarke mit Initiale (Inaktive, Kranke). Mit onClick wird sie zum Knopf. */
export default function PersonChip({ name, tone, onClick, title, children }: PersonChipProps) {
  const style = TONES[tone];
  const content = (
    <>
      <span className={cn("flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold", style.dot)}>{initial(name)}</span>
      {name}
      {children}
    </>
  );
  const chip = cn("inline-flex items-center gap-1.5 rounded-full py-1 pl-1 pr-3 text-[13px] font-medium transition-colors", style.chip);
  return onClick ? (
    <button type="button" onClick={onClick} title={title} className={cn(chip, style.hover)}>
      {content}
    </button>
  ) : (
    <span className={chip}>{content}</span>
  );
}
