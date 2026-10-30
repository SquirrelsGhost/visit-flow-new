import { motion, useReducedMotion } from "motion/react";
import { STORNO_LIMIT } from "../../lib/crm/crmLogic";
import { SOFT_SPRING } from "../../lib/motion/presets";

interface QuoteGaugeProps {
  /** Quote in Prozent; null ohne Aufträge. */
  quote: number | null;
}

/** Skala bis zum Doppelten der Grenze: so liegt die 15-%-Marke immer in der Mitte. */
const SCALE = STORNO_LIMIT * 2;

/** Leiste der Stornoquote mit Marke an der Bonus-Grenze; grün darunter, rot darüber. */
export default function QuoteGauge({ quote }: QuoteGaugeProps) {
  const reduce = useReducedMotion();
  const value = quote ?? 0;
  const width = `${Math.min(100, (value / SCALE) * 100)}%`;
  const over = value > STORNO_LIMIT;
  return (
    <div className="relative mt-5" aria-hidden>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className={over ? "h-full rounded-full bg-gradient-to-r from-rose-400 to-red-500" : "h-full rounded-full bg-gradient-to-r from-emerald-300 to-emerald-500"}
          initial={{ width: reduce ? width : "0%" }}
          animate={{ width }}
          transition={{ ...SOFT_SPRING, delay: reduce ? 0 : 0.25 }}
        />
      </div>
      <span className="absolute -top-1 left-1/2 h-4 w-px -translate-x-1/2 bg-white/60" />
      <div className="mt-1.5 flex justify-between text-[11px] font-medium tabular-nums text-white/45">
        <span>0 %</span>
        <span>{STORNO_LIMIT} %</span>
        <span>{SCALE} %</span>
      </div>
    </div>
  );
}
