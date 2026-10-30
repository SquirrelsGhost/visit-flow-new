// Aufklappbare Festnetz-Liste
"use client";

import { ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { cn } from "../../../lib/cn";
import { eur } from "../../../lib/tariff/eur";
import { FESTNETZ_PLANS } from "../../../lib/tariff/telcoCatalog";
import { pencilSellTexts as t } from "../../../texts/pencilSellTexts";
import Reveal from "../../ui/Reveal";
import { CALC_FIELD_LABEL, CALC_TILE, CALC_TILE_HOVER, CALC_TILE_ON } from "../calcGlass";

interface FestnetzOptionsProps {
  festnetzId: string;
  onSelect: (id: string) => void;
}

const price = (monthly: number) => (monthly === 0 ? t.included : `+${eur(monthly)}${t.perMonth}`);

/** Festnetz-Optionen unter dem Internet-Tarif (Flat inklusive, Auslandsflats gegen Aufpreis). */
export default function FestnetzOptions({ festnetzId, onSelect }: FestnetzOptionsProps) {
  const [open, setOpen] = useState(false);
  const selected = FESTNETZ_PLANS.find((o) => o.id === festnetzId);
  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className={cn(CALC_TILE, CALC_TILE_HOVER, "flex w-full items-center justify-between gap-2 px-4 py-3 text-left")}
      >
        <span className={CALC_FIELD_LABEL}>{t.festnetzOptions}</span>
        <span className="flex min-w-0 items-center gap-2">
          <span className="max-w-[12rem] truncate text-xs text-muted-foreground">{selected?.name || "—"}</span>
          <span className="shrink-0 rounded-full bg-[var(--glass-track)] px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">{price(selected?.monthly ?? 0)}</span>
          <motion.span animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.25 }} className="text-muted-foreground">
            <ChevronRight className="h-3.5 w-3.5" />
          </motion.span>
        </span>
      </button>
      <Reveal show={open}>
        <div className="space-y-2" role="radiogroup" aria-label={t.festnetzOptions}>
          {FESTNETZ_PLANS.map((o) => {
            const active = festnetzId === o.id;
            return (
              <button
                key={o.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onSelect(o.id)}
                className={cn(
                  "flex w-full items-center justify-between gap-2 px-4 py-3 text-left",
                  active ? CALC_TILE_ON : cn(CALC_TILE, CALC_TILE_HOVER),
                )}
              >
                <span className="text-sm">{o.name}</span>
                <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-xs", active ? "bg-gradient-to-b from-red-500 to-red-600 font-semibold text-white" : "bg-[var(--glass-track)] text-muted-foreground")}>
                  {price(o.monthly)}
                </span>
              </button>
            );
          })}
        </div>
      </Reveal>
    </div>
  );
}
