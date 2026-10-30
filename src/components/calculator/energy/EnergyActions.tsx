import { ArrowRight, Presentation, Share2 } from "lucide-react";
import { energyTexts as t } from "../../../texts/energyTexts";
import { CALC_PRIMARY, CALC_SECONDARY, CALC_SUCCESS } from "../calcGlass";

interface EnergyActionsProps {
  onTafel: () => void;
  onAbschluss: () => void;
  onTeilen: () => void;
}

const FOKUS = "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500/20";

/** Reihenfolge an der Tür: erst dem Kunden die Tafel zeigen, dann abschließen oder die Rechnung schicken. */
export default function EnergyActions({ onTafel, onAbschluss, onTeilen }: EnergyActionsProps) {
  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onTafel}
        className={`${CALC_PRIMARY} h-14 text-[15px] ${FOKUS}`}
      >
        <Presentation className="h-4 w-4" /> {t.tafelZeigen}
      </button>
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <button
          type="button"
          onClick={onAbschluss}
          className={`${CALC_SUCCESS} px-4 ${FOKUS}`}
        >
          {t.abschluss} <ArrowRight className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onTeilen}
          className={`${CALC_SECONDARY} ${FOKUS}`}
        >
          <Share2 className="h-4 w-4" /> {t.teilen}
        </button>
      </div>
    </div>
  );
}
