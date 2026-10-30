import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { SECTION_LABEL } from "./battleStyles";

interface SectionTitleProps {
  children: ReactNode;
  /** Kleiner Zähler hinter dem Titel. */
  count?: number;
  /** Punkt vor dem Titel, der "live" pulsiert. */
  live?: boolean;
  /** Aktion ganz rechts (z. B. Kopieren). */
  action?: ReactNode;
  className?: string;
}

/** Leise Überschrift eines Arena-Abschnitts in Versalien, wie GlassSection, mit Zähler und Aktion. */
export default function SectionTitle({ children, count, live = false, action, className }: SectionTitleProps) {
  return (
    <h3 className={cn(SECTION_LABEL, className)}>
      {live && (
        <span aria-hidden className="relative flex h-2 w-2">
          <span className="arena-ping absolute inset-0 rounded-full bg-red-500" />
          <span className="relative h-2 w-2 rounded-full bg-red-500" />
        </span>
      )}
      <span>{children}</span>
      {count !== undefined && (
        <span className="rounded-full bg-[var(--glass-track)] px-1.5 py-px text-[10px] tracking-normal tabular-nums">{count}</span>
      )}
      {action && <span className="ml-auto normal-case tracking-normal">{action}</span>}
    </h3>
  );
}
