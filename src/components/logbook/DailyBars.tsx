import { motion, useReducedMotion } from "motion/react";
import { formatKm } from "../../lib/logbook/logbookFormat";
import { KIND_ORDER, type DayBar } from "../../lib/logbook/logbookLogic";
import type { LogbookTexts } from "../../texts/logbook/logbookTexts";
import { KIND_FILL } from "./logbookStyles";

interface DailyBarsProps {
  bars: readonly DayBar[];
  /** Heutiger Tag im laufenden Monat, sonst null. */
  today: number | null;
  t: LogbookTexts;
}

const HEIGHT = 56;

/** Kilometer je Kalendertag als feine gestapelte Säulen; Tage ohne Fahrt bleiben als Punkt sichtbar. */
export default function DailyBars({ bars, today, t }: DailyBarsProps) {
  const reduce = useReducedMotion();
  const max = Math.max(1, ...bars.map((b) => b.total));
  return (
    <figure>
      <figcaption className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">{t.chart}</figcaption>
      <div className="flex items-end gap-[3px]" style={{ height: HEIGHT }}>
        {bars.map((bar, i) => (
          <div key={bar.day} className="flex h-full min-w-0 flex-1 flex-col justify-end" title={t.chartDay(bar.day, formatKm(bar.total, t))}>
            {bar.total === 0 ? (
              <span className={`mx-auto mb-px block h-[3px] w-[3px] rounded-full ${bar.day === today ? "bg-red-400" : "bg-white/15"}`} />
            ) : (
              <motion.div
                className="flex w-full flex-col-reverse overflow-hidden rounded-[3px]"
                initial={reduce ? false : { height: 0 }}
                animate={{ height: (bar.total / max) * HEIGHT }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: reduce ? 0 : 0.15 + i * 0.012 }}
              >
                {KIND_ORDER.map((kind) => (bar.byKind[kind] > 0 ? <span key={kind} className={KIND_FILL[kind]} style={{ height: `${(bar.byKind[kind] / bar.total) * 100}%` }} /> : null))}
              </motion.div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] tabular-nums text-white/35">
        <span>1</span>
        <span>{Math.ceil(bars.length / 2)}</span>
        <span>{bars.length}</span>
      </div>
    </figure>
  );
}
