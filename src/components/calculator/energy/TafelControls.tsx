import { ArrowRight, ChevronLeft, Eye, Share2 } from "lucide-react";
import type { Tafel } from "../../../lib/energy/energyTafel";
import { energyTafelTexts as t, energyTexts as et } from "../../../texts/energyTexts";

interface TafelControlsProps {
  fertig: boolean;
  letzte: boolean;
  amAnfang: boolean;
  naechste: Tafel | undefined;
  onZurueck: () => void;
  onWeiter: () => void;
  onAlles: () => void;
  onClose: () => void;
  onAbschluss: () => void;
  onTeilen: () => void;
}

const LEISE = "flex items-center justify-center gap-1.5 rounded-2xl bg-white/5 py-3 text-sm font-semibold text-white/80 transition-colors hover:bg-white/10 active:scale-[0.98]";

/** Unterer Rand der Tafel: Zurück, Alles zeigen oder weiter, am Ende Abschluss und Teilen. */
export default function TafelControls(p: TafelControlsProps) {
  return (
    <div className="space-y-2 border-t border-white/10 px-4 pt-3" style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)" }}>
      {p.fertig && p.letzte && (
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={p.onAbschluss}
            className="flex items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-sm font-extrabold shadow-lg shadow-amber-500/25 active:scale-[0.98]"
          >
            {et.abschluss}
          </button>
          <button type="button" onClick={p.onTeilen} className="flex items-center justify-center gap-1.5 rounded-2xl bg-white/10 py-3 text-sm font-bold active:scale-[0.98]">
            <Share2 className="h-4 w-4" /> {et.teilen}
          </button>
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={p.onZurueck} disabled={p.amAnfang} className={`${LEISE} disabled:opacity-30`}>
          <ChevronLeft className="h-4 w-4" /> {t.zurueck}
        </button>
        {!p.fertig ? (
          <button type="button" onClick={p.onAlles} className={LEISE}>
            <Eye className="h-4 w-4" /> {t.allesZeigen}
          </button>
        ) : !p.letzte ? (
          <button type="button" onClick={p.onWeiter} className="flex items-center justify-center gap-1.5 rounded-2xl bg-white/15 py-3 text-sm font-bold active:scale-[0.98]">
            {p.naechste?.art === "zusammen" ? t.weiterZusammen : t.weiterGas} <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button type="button" onClick={p.onClose} className={LEISE}>
            {t.schliessen}
          </button>
        )}
      </div>
    </div>
  );
}
