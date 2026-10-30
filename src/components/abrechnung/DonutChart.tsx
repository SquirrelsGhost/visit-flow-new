import { motion, useReducedMotion } from "motion/react";
import type { FamilySlice } from "../../lib/abrechnung/abrechnungBreakdown";
import AnimatedEuro from "../ui/AnimatedEuro";

interface DonutChartProps {
  slices: FamilySlice[];
  active: string | null;
  total: number;
  label: string;
}

const R = 42;
const C = 2 * Math.PI * R;
const GAP = 2.2;

/** Ring nach Produktfamilie; der gefilterte Teil tritt hervor, die Mitte zeigt seinen Betrag. */
export default function DonutChart({ slices, active, total, label }: DonutChartProps) {
  const reduce = useReducedMotion();
  const focus = slices.find((s) => s.key === active);
  // Startpunkt jedes Stücks = Summe der Stücke davor
  const starts = slices.map((_, i) => slices.slice(0, i).reduce((sum, s) => sum + s.share * C, 0));
  return (
    <div className="relative grid h-36 w-36 shrink-0 place-items-center">
      <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90" aria-hidden="true">
        <circle cx="50" cy="50" r={R} fill="none" strokeWidth="11" className="stroke-slate-100 dark:stroke-white/[0.05]" />
        {slices.map((s, i) => {
          const len = Math.max(0, s.share * C - (slices.length > 1 ? GAP : 0));
          const start = starts[i] ?? 0;
          const dim = active !== null && active !== s.key;
          return (
            <motion.circle
              key={s.key}
              cx="50"
              cy="50"
              r={R}
              fill="none"
              stroke={s.color}
              strokeLinecap="butt"
              strokeDashoffset={-start}
              initial={{ strokeDasharray: `0 ${C}`, opacity: 0 }}
              animate={{ strokeDasharray: `${len} ${C}`, opacity: dim ? 0.25 : 1, strokeWidth: active === s.key ? 14 : 11 }}
              transition={reduce ? { duration: 0 } : { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.05 * i }}
            />
          );
        })}
      </svg>
      <div className="px-4 text-center leading-tight">
        <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase dark:text-neutral-500">{focus ? focus.label : label}</p>
        <p className="mt-0.5 text-base font-bold text-slate-900 tabular-nums dark:text-white">
          <AnimatedEuro value={focus ? focus.amount : total} duration={0.5} />
        </p>
      </div>
    </div>
  );
}
