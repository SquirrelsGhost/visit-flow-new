import { motion, useReducedMotion } from "motion/react";
import type { SummaryTone } from "../../lib/abrechnung/abrechnungSummary";
import { cn } from "../../lib/cn";
import { abrechnungTexts as t } from "../../texts/abrechnungTexts";
import AnimatedEuro from "../ui/AnimatedEuro";
import { INSET } from "./abrechnungStyles";

interface SollIstBarsProps {
  expected: number;
  paid: number;
  tone: SummaryTone;
}

const FILL = {
  ok: "from-emerald-400 to-emerald-600",
  missing: "from-rose-400 to-rose-600",
  extra: "from-amber-300 to-amber-500",
} as const;

/** Erwartet gegen ausgezahlt als zwei Balken auf gleicher Skala; der Unterschied ist sofort sichtbar. */
export default function SollIstBars({ expected, paid, tone }: SollIstBarsProps) {
  const reduce = useReducedMotion();
  const max = Math.max(expected, paid, 1);
  const rows = [
    { label: t.expected, value: expected, width: expected / max, fill: "from-slate-300 to-slate-400 dark:from-neutral-600 dark:to-neutral-500" },
    { label: t.paid, value: paid, width: paid / max, fill: FILL[tone] },
  ];
  return (
    <dl className={cn(INSET, "relative mt-4 space-y-3 p-3.5")}>
      {rows.map((row, i) => (
        <div key={row.label}>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-xs text-slate-500 dark:text-neutral-400">{row.label}</dt>
            <dd className="text-sm font-semibold text-slate-900 tabular-nums dark:text-white">
              <AnimatedEuro value={row.value} from={0} duration={0.9} />
            </dd>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-200/70 dark:bg-white/[0.06]">
            <motion.div
              className={cn("h-full origin-left rounded-full bg-gradient-to-r", row.fill)}
              initial={{ scaleX: reduce ? row.width : 0 }}
              animate={{ scaleX: row.width }}
              transition={reduce ? { duration: 0 } : { duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 + i * 0.12 }}
            />
          </div>
        </div>
      ))}
    </dl>
  );
}
