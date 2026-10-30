import { Check } from "lucide-react";
import { itemSubtitle, itemTitle, monthLabel } from "../../lib/abrechnung/abrechnungFormat";
import type { AbrechnungItem } from "../../lib/abrechnung/abrechnungTypes";
import { claimAmount } from "../../lib/abrechnung/reklamationExport";
import { cn } from "../../lib/cn";
import { eur } from "../../lib/tariff/eur";

interface ReklamationRowProps {
  item: AbrechnungItem;
  selected: boolean;
  onToggle: () => void;
}

/** Eine offene Reklamation im Center; antippen wählt sie zum Erledigen aus. */
export default function ReklamationRow({ item, selected, onToggle }: ReklamationRowProps) {
  const billing = item.billingMonth != null && item.billingYear != null ? monthLabel({ month: item.billingMonth, year: item.billingYear }) : "";
  return (
    <li>
      <label
        className={cn(
          "flex cursor-pointer gap-3 rounded-2xl border p-3 transition-colors",
          selected ? "border-emerald-400 bg-emerald-50/70 dark:border-emerald-500/60 dark:bg-emerald-500/[0.07]" : "border-slate-200/80 hover:border-slate-300 dark:border-white/[0.07]",
        )}
      >
        <input type="checkbox" className="peer sr-only" checked={selected} onChange={onToggle} />
        <span
          aria-hidden="true"
          className={cn(
            "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-500/40",
            selected ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 dark:border-neutral-600",
          )}
        >
          {selected && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline justify-between gap-3">
            <span className="truncate text-sm font-semibold text-slate-900 dark:text-white">{itemTitle(item)}</span>
            <span className="shrink-0 text-sm font-semibold text-slate-900 tabular-nums dark:text-white">{eur(claimAmount(item))}</span>
          </span>
          <span className="block truncate text-xs text-slate-500 dark:text-neutral-400">{[itemSubtitle(item), item.date, billing].filter(Boolean).join(" · ")}</span>
          <span className="mt-1 block text-xs font-medium text-amber-700 dark:text-amber-400">
            {item.reklamationReason}
            {item.reklamationNote ? ` · ${item.reklamationNote}` : ""}
          </span>
        </span>
      </label>
    </li>
  );
}
