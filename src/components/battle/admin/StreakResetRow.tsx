import { ChevronRight, RotateCcw } from "lucide-react";
import { cn } from "../../../lib/cn";
import { battleAdminTexts as t } from "../../../texts/battleAdminTexts";
import { ICON_TILE } from "../battleStyles";

interface StreakResetRowProps {
  onReset: () => void;
}

/** Siegesserien zurücksetzen: dezente rote Zeile; die Rückfrage kommt danach im Dialog. */
export default function StreakResetRow({ onReset }: StreakResetRowProps) {
  return (
    <button
      type="button"
      onClick={onReset}
      className="group flex w-full items-center gap-3.5 rounded-2xl bg-red-50/60 px-4 py-3.5 text-left ring-1 ring-red-500/15 ring-inset transition-colors duration-300 hover:bg-red-50 active:scale-[0.99] dark:bg-red-500/[0.06] dark:hover:bg-red-500/10"
    >
      <span className={cn(ICON_TILE, "h-9 w-9 bg-card text-red-600 ring-red-500/20 dark:bg-red-500/10 dark:text-red-400")}>
        <RotateCcw className="h-[18px] w-[18px]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-red-600 dark:text-red-400">{t.streakReset}</span>
        <span className="mt-0.5 block text-[12px] text-slate-500 dark:text-neutral-400">{t.streakResetHint}</span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-red-400 transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none" />
    </button>
  );
}
