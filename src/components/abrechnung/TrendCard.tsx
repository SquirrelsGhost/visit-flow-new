// Fokus beim Darüberfahren und Zeitraum-Umschalter brauchen State
"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { monthKey, monthLabel } from "../../lib/abrechnung/abrechnungFormat";
import { historySeries, historyStats } from "../../lib/abrechnung/abrechnungSummary";
import type { AbrechnungRecord, MonthRef } from "../../lib/abrechnung/abrechnungTypes";
import { cn } from "../../lib/cn";
import { riseIn } from "../../lib/motion/presets";
import { eur } from "../../lib/tariff/eur";
import { abrechnungTexts as t } from "../../texts/abrechnungTexts";
import AnimatedEuro from "../ui/AnimatedEuro";
import { CARD, CARD_TITLE, GROUP_LABEL, MUTED } from "./abrechnungStyles";
import RangeToggle, { type Range } from "./RangeToggle";
import TrendChart from "./TrendChart";
import TrendStat from "./TrendStat";

interface TrendCardProps {
  history: AbrechnungRecord[];
  selected: MonthRef;
  onSelect: (ref: MonthRef) => void;
}

/** Verlauf der Auszahlungen mit Zeitraum-Wechsel; der gewählte Monat steht rechts im Diagramm. */
export default function TrendCard({ history, selected, onSelect }: TrendCardProps) {
  const [range, setRange] = useState<Range>(6);
  const [focus, setFocus] = useState<number | null>(null);
  const points = historySeries(history, selected, range);
  const stats = historyStats(points);
  const shown = points[focus ?? points.length - 1];

  return (
    <motion.section variants={riseIn} className={cn(CARD, "p-5")} aria-labelledby="abr-trend">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id="abr-trend" className={CARD_TITLE}>
            {t.trendTitle}
          </h2>
          <p className={MUTED}>{t.trendHint}</p>
        </div>
        <RangeToggle value={range} onChange={setRange} />
      </div>

      <div className="mt-4 flex items-end justify-between gap-3" aria-live="polite">
        <div className="min-w-0">
          <p className={GROUP_LABEL}>{shown ? monthLabel(shown) : ""}</p>
          <p className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900 tabular-nums dark:text-white">
            {shown?.hasRecord ? eur(shown.paid) : <span className="text-base font-medium text-slate-400">{t.noRecord}</span>}
          </p>
          {shown?.hasRecord && <p className={MUTED}>{`${eur(shown.expected)} ${t.legendExpected.toLowerCase()}`}</p>}
        </div>
        {focus === null && stats.trend !== null && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ring-1 ring-inset",
              stats.trend >= 0 ? "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300" : "bg-rose-500/10 text-rose-700 ring-rose-500/20 dark:text-rose-300",
            )}
          >
            {stats.trend >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            {`${stats.trend >= 0 ? "+" : ""}${stats.trend.toFixed(1).replace(".", ",")} % ${t.vsLastMonth}`}
          </span>
        )}
      </div>

      <TrendChart key={`${range}-${monthKey(selected)}`} points={points} selected={selected} focus={focus} onFocus={setFocus} onSelect={onSelect} />

      <div className="mt-2 flex items-center gap-4 text-[11px] text-slate-500 dark:text-neutral-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-[3px] bg-gradient-to-b from-emerald-400 to-emerald-600" /> {t.legendPaid}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 border-t-[1.6px] border-dashed border-slate-500 dark:border-neutral-400" /> {t.legendExpected}
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 dark:border-white/[0.06]">
        <TrendStat label={t.sumPeriod} value={<AnimatedEuro value={stats.totalPaid} from={0} duration={0.9} />} />
        <TrendStat label={t.average} value={<AnimatedEuro value={stats.average} from={0} duration={0.9} />} />
        <TrendStat label={t.bestMonth} value={stats.best ? monthLabel(stats.best).replace(/ \d+$/, "") : "–"} />
      </dl>
    </motion.section>
  );
}

