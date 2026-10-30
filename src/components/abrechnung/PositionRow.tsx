// Aufklappen pro Zeile braucht State
"use client";

import { Check, ChevronDown, MessageSquareWarning } from "lucide-react";
import { useState } from "react";
import { itemAmount, itemSubtitle, itemTitle, monthLabel } from "../../lib/abrechnung/abrechnungFormat";
import { viewStatus } from "../../lib/abrechnung/abrechnungStatus";
import type { AbrechnungItem } from "../../lib/abrechnung/abrechnungTypes";
import { cn } from "../../lib/cn";
import { eur } from "../../lib/tariff/eur";
import { abrechnungTexts as t } from "../../texts/abrechnungTexts";
import Reveal from "../ui/Reveal";
import { SMALL_BUTTON } from "./abrechnungStyles";
import ItemDetails from "./ItemDetails";
import StatusChip from "./StatusChip";

interface PositionRowProps {
  item: AbrechnungItem;
  onTakeOver: () => void;
  onClaim: () => void;
}

/** Eine Position des Monats; aufgeklappt mit Einzelheiten und der passenden Aktion. */
export default function PositionRow({ item, onTakeOver, onClaim }: PositionRowProps) {
  const [open, setOpen] = useState(false);
  const status = viewStatus(item);
  const crossNote =
    item.soldInMonth != null
      ? t.soldIn(monthLabel({ month: item.soldInMonth, year: item.soldInYear ?? 0 }))
      : item.crossMonthMatched && item.paidInMonth != null
        ? t.paidWith(monthLabel({ month: item.paidInMonth, year: item.paidInYear ?? 0 }))
        : null;
  const canClaim = !item.reklamiert && (status === "open" || status === "mismatch");
  const canTakeOver = !item.reklamiert && status === "untracked";

  return (
    <li className="px-4 py-3">
      <button type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)} className="flex w-full items-start gap-3 text-left">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{itemTitle(item)}</p>
          <p className="truncate text-xs text-slate-500 dark:text-neutral-400">{[itemSubtitle(item), item.date].filter(Boolean).join(" · ")}</p>
          {crossNote && <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-400">{crossNote}</p>}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="text-sm font-semibold text-slate-900 tabular-nums dark:text-white">{eur(itemAmount(item))}</span>
          <StatusChip status={status} />
        </div>
        <ChevronDown className={cn("mt-0.5 h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300", open && "rotate-180")} />
      </button>
      <Reveal show={open}>
        <ItemDetails item={item} />
        {(canClaim || canTakeOver) && (
          <div className="mt-2 flex justify-end">
            <button type="button" className={SMALL_BUTTON} onClick={canTakeOver ? onTakeOver : onClaim}>
              {canTakeOver ? <Check className="h-3.5 w-3.5" /> : <MessageSquareWarning className="h-3.5 w-3.5" />}
              {canTakeOver ? t.takeOver : t.claim}
            </button>
          </div>
        )}
      </Reveal>
    </li>
  );
}
