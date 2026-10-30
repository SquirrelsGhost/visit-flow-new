import { motion, useReducedMotion } from "motion/react";
import { useElementWidth } from "../../hooks/useElementWidth";
import { monthKey, monthLabel } from "../../lib/abrechnung/abrechnungFormat";
import type { HistoryPoint } from "../../lib/abrechnung/abrechnungSummary";
import type { MonthRef } from "../../lib/abrechnung/abrechnungTypes";
import { cn } from "../../lib/cn";
import { eur } from "../../lib/tariff/eur";
import { abrechnungTexts as t } from "../../texts/abrechnungTexts";

interface TrendChartProps {
  points: HistoryPoint[];
  selected: MonthRef;
  focus: number | null;
  onFocus: (index: number | null) => void;
  onSelect: (ref: MonthRef) => void;
}

const H = 170;
const TOP = 12;
const BOTTOM = 22;
const EASE = [0.22, 1, 0.36, 1] as const;

/** Balken = ausgezahlt, Linie = erwartet. Antippen springt in den Monat. Ohne Bewegung steht alles sofort. */
export default function TrendChart({ points, selected, focus, onFocus, onSelect }: TrendChartProps) {
  const reduce = useReducedMotion();
  // Echte Pixelbreite statt fester viewBox: so bleibt das Diagramm auf jedem Bildschirm gleich hoch
  const { ref, width: W } = useElementWidth<HTMLDivElement>(320);
  const max = Math.max(1, ...points.map((p) => Math.max(p.paid, p.expected))) * 1.08;
  const slot = W / points.length;
  const barW = Math.min(slot * 0.5, 34);
  const y = (v: number) => TOP + (H - TOP - BOTTOM) * (1 - v / max);
  const cx = (i: number) => slot * i + slot / 2;
  const line = points
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => p.hasRecord)
    .map(({ p, i }, n) => `${n ? "L" : "M"}${cx(i).toFixed(1)},${y(p.expected).toFixed(1)}`)
    .join(" ");
  const selKey = monthKey(selected);

  return (
    <div ref={ref} className="relative mt-3" onPointerLeave={() => onFocus(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} height={H} className="block w-full overflow-visible" aria-hidden="true">
        <defs>
          <linearGradient id="trend-bar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line key={f} x1="0" x2={W} y1={y(max * f)} y2={y(max * f)} className="stroke-slate-200/70 dark:stroke-white/[0.06]" strokeDasharray="2 4" />
        ))}
        {points.map((p, i) => {
          const active = monthKey(p) === selKey || focus === i;
          const top = y(p.paid);
          const height = Math.max(p.hasRecord ? 3 : 0, H - BOTTOM - top);
          return (
            <g key={monthKey(p)} className={cn("transition-opacity duration-300", focus !== null && focus !== i && monthKey(p) !== selKey && "opacity-45")}>
              {p.hasRecord ? (
                <motion.rect
                  x={cx(i) - barW / 2}
                  y={H - BOTTOM - height}
                  width={barW}
                  height={height}
                  rx={Math.min(6, barW / 2)}
                  fill="url(#trend-bar)"
                  opacity={active ? 1 : 0.55}
                  style={{ transformBox: "fill-box", transformOrigin: "bottom" }}
                  initial={{ scaleY: reduce ? 1 : 0 }}
                  animate={{ scaleY: 1 }}
                  transition={reduce ? { duration: 0 } : { duration: 0.7, ease: EASE, delay: 0.05 + i * 0.035 }}
                />
              ) : (
                <rect x={cx(i) - barW / 2} y={H - BOTTOM - 4} width={barW} height={4} rx={2} className="fill-slate-200 dark:fill-white/[0.08]" />
              )}
              <text x={cx(i)} y={H - 6} textAnchor="middle" className={cn("text-[11px] font-medium", active ? "fill-slate-900 dark:fill-white" : "fill-slate-400 dark:fill-neutral-500")}>
                {p.label}
              </text>
            </g>
          );
        })}
        {line && (
          <motion.path
            d={line}
            fill="none"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="4 4"
            className="stroke-slate-500 dark:stroke-neutral-400"
            initial={{ pathLength: reduce ? 1 : 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={reduce ? { duration: 0 } : { duration: 1.1, ease: EASE, delay: 0.3 }}
          />
        )}
        {points.map((p, i) =>
          p.hasRecord ? <circle key={`d${monthKey(p)}`} cx={cx(i)} cy={y(p.expected)} r={focus === i ? 3.6 : 2.4} className="fill-white stroke-slate-500 transition-[r] duration-200 dark:fill-neutral-900 dark:stroke-neutral-300" strokeWidth={1.4} /> : null,
        )}
      </svg>
      <div className="absolute inset-0 flex">
        {points.map((p, i) => (
          <button
            key={monthKey(p)}
            type="button"
            className="h-full flex-1 rounded-lg focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:outline-none"
            aria-label={`${monthLabel(p)}: ${p.hasRecord ? `${eur(p.paid)} ${t.legendPaid}, ${eur(p.expected)} ${t.legendExpected}` : t.noRecord}`}
            aria-current={monthKey(p) === selKey ? "date" : undefined}
            onPointerEnter={() => onFocus(i)}
            onFocus={() => onFocus(i)}
            onBlur={() => onFocus(null)}
            onClick={() => onSelect(p)}
          />
        ))}
      </div>
    </div>
  );
}
