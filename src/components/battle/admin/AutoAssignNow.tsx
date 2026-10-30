import { ChevronRight, Loader2, Zap } from "lucide-react";
import { cn } from "../../../lib/cn";
import { battleAdminTexts as t } from "../../../texts/battleAdminTexts";
import { ICON_TILE, INSET } from "../battleStyles";

interface AutoAssignNowProps {
  busy: boolean;
  onTrigger: () => void;
}

/** Auto-Zuweisung sofort auslösen: ruhige Aktionszeile statt eines lauten Balkens; beim Laden dreht sich das Symbol. */
export default function AutoAssignNow({ busy, onTrigger }: AutoAssignNowProps) {
  return (
    <button
      type="button"
      onClick={onTrigger}
      disabled={busy}
      className={cn(INSET, "group flex w-full items-center gap-3.5 px-4 py-3.5 text-left transition-[background-color,transform] duration-300 hover:bg-amber-50/60 active:scale-[0.99] disabled:opacity-70 dark:hover:bg-amber-500/[0.06]")}
    >
      <span className={cn(ICON_TILE, "h-9 w-9 bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-[0_6px_16px_-6px_rgba(249,115,22,0.7)] ring-white/20")}>
        {busy ? <Loader2 className="h-[18px] w-[18px] animate-spin" /> : <Zap className="h-[18px] w-[18px]" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-slate-900 dark:text-white">{t.autoNow}</span>
        <span className="mt-0.5 block text-[12px] text-slate-500 dark:text-neutral-400">{t.autoNowHint}</span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none dark:text-neutral-600" />
    </button>
  );
}
