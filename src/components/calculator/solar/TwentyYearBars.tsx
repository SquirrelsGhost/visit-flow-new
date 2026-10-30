// Balken wachsen weich auf ihre neue Länge
"use client";

import { Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { eur } from "../../../lib/tariff/eur";
import type { SolarResult } from "../../../lib/solar/solarCalc";
import { SOFT_SPRING } from "../../../lib/motion/presets";
import { solarTexts as t } from "../../../texts/solarTexts";
import { CALC_CARD, CALC_LABEL } from "../calcGlass";

interface TwentyYearBarsProps {
  result: SolarResult;
}

const Bar = ({ width, className }: { width: number; className: string }) => (
  <motion.div className={`h-full ${className}`} initial={false} animate={{ width: `${Math.max(0, Math.min(100, width))}%` }} transition={SOFT_SPRING} />
);

/** Gesamtkosten über 20 Jahre ohne und mit Solar, die Ersparnis als heller Teil des Balkens. */
export default function TwentyYearBars({ result }: TwentyYearBarsProps) {
  const { totalAlt20Years: alt, totalNeu20Years: neu, totalSavings20Years: save } = result;
  const gain = save > 0;
  return (
    <div className={`${CALC_CARD} shrink-0 space-y-3.5`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className={CALC_LABEL}>{t.twenty}</span>
        {gain ? (
          <span className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 sm:text-xs">
            <Sparkles className="h-3 w-3 motion-safe:animate-pulse" />
            {t.twentySavings} {eur(save)}
          </span>
        ) : (
          <span className="shrink-0 whitespace-nowrap rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-[10px] font-bold text-rose-600 dark:text-rose-400 sm:text-xs">
            {t.twentyExtra} {eur(Math.abs(save))}
          </span>
        )}
      </div>
      <div className="space-y-3.5 text-xs">
        <div className="space-y-1">
          <div className="flex items-baseline justify-between gap-2 text-[10px] text-muted-foreground sm:text-xs">
            <span className="truncate">{t.without}</span>
            <span className="shrink-0 whitespace-nowrap font-semibold tabular-nums">{eur(alt)}</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--glass-track)]">
            <Bar width={gain ? 100 : (alt / neu) * 100} className="rounded-full bg-slate-400 dark:bg-slate-500" />
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex items-baseline justify-between gap-2 text-[10px] text-muted-foreground sm:text-xs">
            <span className="truncate">{t.with}</span>
            <span className={`shrink-0 whitespace-nowrap font-bold tabular-nums ${gain ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}>
              {eur(neu)}
            </span>
          </div>
          <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--glass-track)]">
            {gain ? (
              <>
                <Bar width={(neu / alt) * 100} className="bg-emerald-600 dark:bg-emerald-500" />
                <Bar width={(save / alt) * 100} className="bg-gradient-to-r from-teal-400 to-emerald-400 dark:from-teal-500 dark:to-emerald-500" />
              </>
            ) : (
              <Bar width={100} className="rounded-full bg-rose-500" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
