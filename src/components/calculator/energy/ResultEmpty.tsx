import { Check } from "lucide-react";
import { cn } from "../../../lib/cn";
import type { Schritt } from "../../../lib/energy/energyPreview";
import { energyTexts as t } from "../../../texts/energyTexts";
import { CALC_CARD, CALC_CHECK_ON } from "../calcGlass";

interface ResultEmptyProps {
  offen: Schritt[];
}

const ALLE: Schritt[] = ["verbrauch", "heute", "tarif"];

/** Noch kein Ergebnis: zeigt, welche Angaben fehlen, statt ausgegrauter Knöpfe. */
export default function ResultEmpty({ offen }: ResultEmptyProps) {
  return (
    <div className={`${CALC_CARD} p-5`}>
      <p className="text-[15px] font-semibold tracking-[-0.01em]">{t.offenTitel(Math.max(1, offen.length))}</p>
      <ul className="mt-3 space-y-2">
        {ALLE.map((schritt) => {
          const erledigt = !offen.includes(schritt);
          return (
            <li key={schritt} className={cn("flex items-center gap-2.5 text-sm", erledigt ? "text-muted-foreground line-through" : "font-medium")}>
              <span
                aria-hidden="true"
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                  erledigt ? CALC_CHECK_ON : "bg-[var(--glass-track)]",
                )}
              >
                {erledigt && <Check className="h-3 w-3" strokeWidth={3} />}
              </span>
              {t.offen[schritt]}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
