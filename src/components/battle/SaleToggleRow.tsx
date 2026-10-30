import { Check, Loader2, X } from "lucide-react";
import type { BattleProduct } from "../../lib/battle/battleTypes";
import { cn } from "../../lib/cn";
import { battleDialogTexts as t } from "../../texts/battleTexts";
import { CATEGORY_ICONS } from "../../lib/battle/battleCategories";

interface SaleToggleRowProps {
  sale: BattleProduct;
  busy: boolean;
  onToggle: () => void;
}

const time = (ts: BattleProduct["timestamp"]) =>
  ts ? new Date(ts).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) : "";

/** Ein Sale von heute: zählt (grüner Haken) oder ist ausgeschlossen (durchgestrichen, rot). */
export default function SaleToggleRow({ sale, busy, onToggle }: SaleToggleRowProps) {
  const excluded = !!sale.battleExcluded;
  return (
    <div className={cn("flex items-center gap-3 rounded-2xl p-3 ring-1 ring-inset transition-colors duration-300", excluded ? "bg-red-500/[0.06] ring-red-500/15" : "bg-emerald-500/[0.06] ring-emerald-500/15")}>
      <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--glass-track)] text-[16px]">
        {CATEGORY_ICONS[sale.category ?? ""] ?? "•"}
      </span>
      <div className="min-w-0 flex-1">
        <p className={cn("text-[14px] font-semibold", excluded ? "text-red-700 line-through decoration-red-500/50 dark:text-red-300" : "text-foreground")}>
          {sale.category} {sale.isPremium ? "⭐" : ""}
        </p>
        <p className="truncate text-[12px] text-muted-foreground">
          {t.clock(time(sale.timestamp))}
          {sale.type ? ` · ${sale.type}` : ""}
        </p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        disabled={busy}
        className={cn(
          "inline-flex h-9 shrink-0 items-center gap-1 rounded-full px-3 text-[12.5px] font-semibold ring-1 ring-inset transition-[background-color,transform] active:scale-95 disabled:opacity-60",
          excluded ? "text-emerald-700 ring-emerald-500/30 hover:bg-emerald-500/10 dark:text-emerald-300" : "text-red-600 ring-red-500/30 hover:bg-red-500/10 dark:text-red-300",
        )}
      >
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : excluded ? <>{t.salesCount} <Check className="h-3.5 w-3.5" /></> : <>{t.salesExclude} <X className="h-3.5 w-3.5" /></>}
      </button>
    </div>
  );
}
