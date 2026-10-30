import { RotateCcw, Zap } from "lucide-react";
import { energyTexts as t } from "../../../texts/energyTexts";
import GlassChip from "../../glass/GlassChip";

interface EnergyInfoBarProps {
  onNeuStarten: () => void;
}

/** Schmale Infozeile statt Seitentitel: Sparte, Zweck und "Neu starten" griffbereit oben rechts. */
export default function EnergyInfoBar({ onNeuStarten }: EnergyInfoBarProps) {
  return (
    <div className="relative flex items-center justify-between gap-3 px-1">
      <div className="flex min-w-0 items-center gap-2">
        <GlassChip tone="amber">
          <Zap className="h-3 w-3" /> {t.badge}
        </GlassChip>
        <span className="truncate text-[12px] text-[var(--glass-label)]">{t.info}</span>
      </div>
      <button
        type="button"
        onClick={onNeuStarten}
        className="glass-surface flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-foreground/80 transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
      >
        <RotateCcw className="h-3.5 w-3.5" /> {t.neuStarten}
      </button>
    </div>
  );
}
