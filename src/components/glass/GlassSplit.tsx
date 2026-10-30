import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { GLASS_SPLIT, GLASS_SPLIT_COL, GLASS_SPLIT_RATIO } from "./glassStyles";

interface GlassSplitProps {
  /** Linke Spalte ab iPad quer: Kopfkarte, Filter, Aktionen. Auf dem Handy oben. */
  aside: ReactNode;
  /** aside: links schmal (5:7), even: beide gleich breit. */
  ratio?: keyof typeof GLASS_SPLIT_RATIO;
  /** Linke Spalte bleibt beim Scrollen stehen, damit neben einer langen Liste keine leere Fläche entsteht. */
  sticky?: boolean;
  children: ReactNode;
}

/**
 * Zwei Spalten ab iPad quer (lg): links die Steuerung, rechts der Inhalt.
 * Darunter stehen beide wie gewohnt untereinander mit 28px Abstand.
 */
export default function GlassSplit({ aside, ratio = "aside", sticky = false, children }: GlassSplitProps) {
  return (
    <div className={cn(GLASS_SPLIT, GLASS_SPLIT_RATIO[ratio])}>
      <div className={cn(GLASS_SPLIT_COL, sticky && "lg:sticky lg:top-5")}>{aside}</div>
      <div className={GLASS_SPLIT_COL}>{children}</div>
    </div>
  );
}
