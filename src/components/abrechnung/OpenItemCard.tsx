// Aufklappen pro Karte braucht State
"use client";

import { Check, ChevronDown, MessageSquareWarning } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { itemAmount, itemSubtitle, itemTitle, monthName } from "../../lib/abrechnung/abrechnungFormat";
import type { AbrechnungItem, MonthRef } from "../../lib/abrechnung/abrechnungTypes";
import { cn } from "../../lib/cn";
import { riseIn } from "../../lib/motion/presets";
import { eur } from "../../lib/tariff/eur";
import { abrechnungTexts as t } from "../../texts/abrechnungTexts";
import Reveal from "../ui/Reveal";
import { SMALL_BUTTON } from "./abrechnungStyles";
import ItemDetails from "./ItemDetails";

interface OpenItemCardProps {
  item: AbrechnungItem;
  current: MonthRef;
  selected: boolean;
  selectionActive: boolean;
  onToggle: () => void;
  onTakeOver: () => void;
  onClaim: () => void;
}

/** Offener Punkt (v1 renderOpenItem): ganze Karte wählt aus, der Pfeil klappt die Einzelheiten auf. */
export default function OpenItemCard({ item, current, selected, selectionActive, onToggle, onTakeOver, onClaim }: OpenItemCardProps) {
  const [open, setOpen] = useState(false);
  const canSelect = !item.reklamiert;
  const otherMonth = item.billingMonth !== undefined && (item.billingMonth !== current.month || item.billingYear !== current.year);
  const meta = [
    item.date,
    otherMonth && t.fromMonth(`${monthName(item.billingMonth!)}${item.billingYear !== current.year ? ` ${item.billingYear}` : ""}`),
    item.webOrderId && `WO ${item.webOrderId}`,
  ]
    .filter(Boolean)
    .join(" · ");
  const Wrap = canSelect ? "label" : "div";

  return (
    <motion.li variants={riseIn} layout="position">
      <Wrap
        className={cn(
          "block rounded-2xl border bg-white/90 p-3.5 transition-[border-color,background-color,box-shadow] duration-300 dark:bg-white/[0.03]",
          canSelect && "cursor-pointer",
          selected
            ? "border-emerald-400 bg-emerald-50/70 shadow-[0_0_0_3px_rgba(16,185,129,0.12)] dark:border-emerald-500/60 dark:bg-emerald-500/[0.07]"
            : "border-slate-200/80 hover:border-slate-300 dark:border-white/[0.07] dark:hover:border-white/[0.14]",
        )}
      >
        <div className="flex gap-3">
          {canSelect && (
            <>
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
            </>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-3">
              <p className="truncate font-semibold text-slate-900 dark:text-white">{itemTitle(item)}</p>
              <p className="shrink-0 font-semibold text-slate-900 tabular-nums dark:text-white">{eur(itemAmount(item))}</p>
            </div>
            {itemSubtitle(item) && <p className="mt-0.5 truncate text-sm text-slate-500 dark:text-neutral-400">{itemSubtitle(item)}</p>}
            <div className="mt-1.5 flex items-center justify-between gap-2">
              <p className="min-w-0 truncate text-xs text-slate-500 dark:text-neutral-400">{meta}</p>
              <div className="flex shrink-0 items-center gap-1">
                {canSelect && !selectionActive && (
                  <button type="button" className={SMALL_BUTTON} onClick={(e) => {
                      e.preventDefault();
                      if (item.status === "missing_in_system") onTakeOver();
                      else onClaim();
                    }}>
                    {item.status === "missing_in_system" ? <Check className="h-3.5 w-3.5" /> : <MessageSquareWarning className="h-3.5 w-3.5" />}
                    {item.status === "missing_in_system" ? t.takeOver : t.claim}
                  </button>
                )}
                <button
                  type="button"
                  aria-expanded={open}
                  aria-label={t.details}
                  onClick={(e) => {
                    e.preventDefault();
                    setOpen((v) => !v);
                  }}
                  className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/[0.06] dark:hover:text-white"
                >
                  <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", open && "rotate-180")} />
                </button>
              </div>
            </div>
            {item.reklamiert && !open && (
              <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                <MessageSquareWarning className="h-3.5 w-3.5 shrink-0" />
                {item.reklamationReason}
              </p>
            )}
            <Reveal show={open}>
              <ItemDetails item={item} />
            </Reveal>
          </div>
        </div>
      </Wrap>
    </motion.li>
  );
}
