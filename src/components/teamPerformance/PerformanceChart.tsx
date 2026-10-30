import { motion, useReducedMotion } from "motion/react";
import { useId, type PointerEvent } from "react";
import { useElementWidth } from "../../hooks/useElementWidth";
import { niceMax, smoothPath, tickIndexes } from "../../lib/team/chartPath";
import { formatPerfDay, type Metric } from "../../lib/team/teamPerformance";

interface PerformanceChartProps {
  values: readonly number[];
  dates: readonly string[];
  metric: Metric;
  focus: number | null;
  onFocus: (index: number | null) => void;
  label: string;
}

const H = 176;
const TOP = 10;
const BOTTOM = 24;
const PAD = 6;
const EASE = [0.22, 1, 0.36, 1] as const;
/** Farben wie v1: Türen Indigo, Sales Grün, Umsatz Lila. */
const COLOR: Record<Metric, string> = { visits: "#6366f1", sales: "#10b981", umsatz: "#a855f7" };

const shortDate = (date: string) => formatPerfDay(date).replace(/^\S+\s/, "");

/** Flächendiagramm: die Linie zeichnet sich weich ein, Finger oder Maus zeigen den Wert eines Tages. */
export default function PerformanceChart({ values, dates, metric, focus, onFocus, label }: PerformanceChartProps) {
  const reduce = useReducedMotion();
  const gradient = useId();
  const { ref, width: W } = useElementWidth<HTMLDivElement>(320);
  const max = niceMax(Math.max(...values, 0) * 1.08);
  const span = Math.max(1, values.length - 1);
  const x = (i: number) => PAD + ((W - PAD * 2) * i) / span;
  const y = (v: number) => TOP + (H - TOP - BOTTOM) * (1 - v / max);
  const points = values.map((v, i) => ({ x: x(i), y: y(v) }));
  const line = smoothPath(points, TOP, H - BOTTOM);
  const area = points.length > 1 ? `${line} L${x(values.length - 1)},${H - BOTTOM} L${x(0)},${H - BOTTOM} Z` : "";
  const color = COLOR[metric];
  const focused = focus !== null ? points[focus] : undefined;

  const pick = (event: PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - rect.left - PAD) / Math.max(1, rect.width - PAD * 2);
    onFocus(Math.max(0, Math.min(values.length - 1, Math.round(ratio * span))));
  };

  return (
    <div ref={ref} className="relative mt-3">
      <svg viewBox={`0 0 ${W} ${H}`} height={H} className="block w-full touch-pan-y overflow-visible" role="img" aria-label={label} onPointerMove={pick} onPointerDown={pick} onPointerLeave={() => onFocus(null)}>
        <defs>
          <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.32} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line key={f} x1={0} x2={W} y1={y(max * f)} y2={y(max * f)} className="stroke-slate-300/60 dark:stroke-white/[0.07]" strokeDasharray="2 5" />
        ))}
        <line x1={0} x2={W} y1={H - BOTTOM} y2={H - BOTTOM} className="stroke-slate-300 dark:stroke-white/15" />
        {area && <motion.path d={area} fill={`url(#${gradient})`} initial={{ opacity: reduce ? 1 : 0 }} animate={{ opacity: 1 }} transition={{ duration: reduce ? 0 : 0.8, delay: reduce ? 0 : 0.35 }} />}
        <motion.path
          d={line}
          fill="none"
          stroke={color}
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: `drop-shadow(0 4px 10px ${color}55)` }}
          initial={{ pathLength: reduce ? 1 : 0 }}
          animate={{ pathLength: 1 }}
          transition={reduce ? { duration: 0 } : { duration: 1.1, ease: EASE }}
        />
        {focused && (
          <g>
            <line x1={focused.x} x2={focused.x} y1={TOP} y2={H - BOTTOM} className="stroke-slate-400/60 dark:stroke-white/25" strokeDasharray="3 3" />
            <circle cx={focused.x} cy={focused.y} r={5.5} fill={color} className="stroke-white dark:stroke-[#0c0e17]" strokeWidth={2.5} />
          </g>
        )}
        {tickIndexes(dates.length).map((i) => (
          <text key={i} x={x(i)} y={H - 6} textAnchor={i === 0 ? "start" : i === dates.length - 1 ? "end" : "middle"} className="fill-slate-400 text-[11px] font-medium dark:fill-white/40">
            {dates[i] ? shortDate(dates[i]) : ""}
          </text>
        ))}
      </svg>
    </div>
  );
}
