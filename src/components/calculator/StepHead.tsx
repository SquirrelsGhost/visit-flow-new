import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { CALC_CHECK_ON, CALC_LABEL } from "./calcGlass";

interface StepHeadProps {
  schritt: number;
  titel: string;
  hinweis: string;
  /** Fertig: die Nummer wird zum grünen Haken. */
  fertig?: boolean;
  /** Rechts: Betrag, Knopf o. Ä. */
  trailing?: ReactNode;
}

/** Kopf eines Rechner-Schritts, gleich in Strom/Gas, Telco und Lead: Nummer oder Haken, Titel, kurze Hilfe, rechts ein Wert. */
export default function StepHead({ schritt, titel, hinweis, fertig = false, trailing }: StepHeadProps) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <span
          aria-hidden="true"
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors duration-300",
            fertig ? CALC_CHECK_ON : "bg-[var(--glass-track)] text-muted-foreground",
          )}
        >
          {fertig ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : schritt}
        </span>
        <div className="min-w-0">
          <span className={cn(CALC_LABEL, "block")}>{titel}</span>
          <span className="mt-0.5 block truncate text-[13px] font-medium text-foreground/85">{hinweis}</span>
        </div>
      </div>
      {trailing}
    </div>
  );
}
