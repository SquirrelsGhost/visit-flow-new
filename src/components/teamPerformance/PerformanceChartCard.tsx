// Kennzahl, Darstellung und der angetippte Tag sind lokaler State
"use client";

import { useState } from "react";
import type { Vertical } from "../../lib/battle/battleCategories";
import { eur } from "../../lib/tariff/eur";
import { METRICS, splitPeriods, totalsOf, trendSeries, formatPerfDay, type ChartMode, type Metric, type PerformanceDay, type Period } from "../../lib/team/teamPerformance";
import { fill } from "../../texts/profileTexts";
import { teamPerformanceTexts as texts } from "../../texts/teamPerformanceTexts";
import GlassCard from "../glass/GlassCard";
import GlassFilterChips from "../glass/GlassFilterChips";
import { GLASS_LABEL } from "../glass/glassStyles";
import ModeToggle from "./ModeToggle";
import PerformanceChart from "./PerformanceChart";

interface PerformanceChartCardProps {
  /** Ganzer geladener Verlauf (Zeitraum und Vorlauf davor). */
  days: readonly PerformanceDay[];
  period: Period;
  vertical: Vertical;
}

const INT = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 });
const format = (metric: Metric, value: number) => (metric === "umsatz" ? eur(Math.round(value)) : INT.format(value));

/** Verlauf einer Kennzahl über den Zeitraum, täglich oder als 7-Tage-Trend; oben steht der Wert des angetippten Tages. */
export default function PerformanceChartCard({ days, period, vertical }: PerformanceChartCardProps) {
  const [metric, setMetric] = useState<Metric>("visits");
  const [mode, setMode] = useState<ChartMode>("daily");
  const [focus, setFocus] = useState<number | null>(null);
  const { current } = splitPeriods(days, period);
  const values = mode === "trend" ? trendSeries(days, period, metric) : current.map((d) => d[metric]);
  const dates = current.map((d) => d.date);
  const index = focus ?? null;
  const shownValue = index !== null ? (values[index] ?? 0) : totalsOf(current)[metric];
  const caption = index !== null ? `${formatPerfDay(dates[index] ?? "")}${mode === "trend" ? ` · ${texts.trendNote}` : ""}` : fill(texts.total, { days: period });
  const options = METRICS.map((m) => ({ id: m, label: texts.metric(m, vertical) }));

  return (
    <GlassCard className="p-4 pb-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className={`${GLASS_LABEL} !p-0`}>{texts.chart}</h3>
        <ModeToggle mode={mode} onChange={setMode} />
      </div>
      <div className="mt-3">
        <GlassFilterChips options={options} active={metric} onChange={setMetric} label={texts.metricLabel} layoutId="perf-metric" />
      </div>
      <div className="mt-4 min-h-[3.25rem]" aria-live="polite">
        <p className="text-[28px] font-semibold leading-none tracking-[-0.03em] text-foreground tabular-nums">{format(metric, shownValue)}</p>
        <p className="mt-1.5 text-[12.5px] text-muted-foreground">{caption}</p>
      </div>
      <PerformanceChart key={`${period}-${metric}-${mode}`} values={values} dates={dates} metric={metric} focus={index} onFocus={setFocus} label={`${texts.metric(metric, vertical)} · ${fill(texts.lastDays, { days: period })}`} />
    </GlassCard>
  );
}
