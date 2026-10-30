import { Sparkles } from "lucide-react";
import { solarTexts as t } from "../../../texts/solarTexts";

interface AutoOptimizeBannerProps {
  onOptimize: () => void;
}

/** "Optimieren" als kleiner Knopf im Kopf des Schritts Anlage: stellt die wirtschaftlichste Größe für den Verbrauch ein. */
export default function AutoOptimizeBanner({ onOptimize }: AutoOptimizeBannerProps) {
  return (
    <button
      type="button"
      onClick={onOptimize}
      title={`${t.optimizeTitle}: ${t.optimizeText}`}
      className="flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-500/12 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-500/25 transition-[background-color,transform] duration-200 hover:bg-emerald-500/20 active:scale-95 dark:text-emerald-300"
    >
      <Sparkles className="h-3.5 w-3.5" /> {t.optimize}
    </button>
  );
}
