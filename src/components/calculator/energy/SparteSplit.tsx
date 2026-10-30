import { Plus } from "lucide-react";
import { cn } from "../../../lib/cn";
import type { Sparte } from "../../../lib/energy/energyCalc";
import { formatEuro } from "../../../lib/energy/energyNumbers";
import { SPARTEN } from "../../../lib/energy/energyState";
import type { TafelTeil } from "../../../lib/energy/energyTafel";
import { energyTexts as t } from "../../../texts/energyTexts";
import { CALC_TILE } from "../calcGlass";
import { FARBE } from "./energyStyles";

interface SparteSplitProps {
  teile: TafelTeil[];
  onSparte: (s: Sparte) => void;
}

/** Ersparnis je Sparte; fehlt eine, lädt ein Knopf dazu ein, sie mitzurechnen (Kombi verkauft sich besser). */
export default function SparteSplit({ teile, onSparte }: SparteSplitProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {SPARTEN.map((sparte) => {
        const teil = teile.find((x) => x.sparte === sparte);
        if (!teil) {
          return (
            <button
              key={sparte}
              type="button"
              onClick={() => onSparte(sparte)}
              className="flex items-center justify-center gap-1.5 rounded-2xl border border-dashed border-[var(--glass-label)]/30 px-3 py-3 text-xs font-semibold text-muted-foreground transition-colors hover:bg-[var(--glass-hover)] hover:text-foreground"
            >
              <Plus className="h-3.5 w-3.5" /> {t.dazu(t.sparte[sparte])}
            </button>
          );
        }
        const cent = teil.ergebnis.ersparnisJahr1Cent;
        return (
          <div key={sparte} className={`${CALC_TILE} px-3 py-3`}>
            <span className={cn("text-[10px] font-black uppercase tracking-wider", FARBE[sparte].text)}>{t.sparte[sparte]}</span>
            <span className="block text-sm font-bold tabular-nums">
              {cent > 0 ? t.sparteSpart(formatEuro(cent)) : t.keinVorteil}
            </span>
          </div>
        );
      })}
    </div>
  );
}
