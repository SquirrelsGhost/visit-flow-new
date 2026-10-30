import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { monthLabel, monthKey } from "../../lib/abrechnung/abrechnungFormat";
import type { MonthRef } from "../../lib/abrechnung/abrechnungTypes";
import { riseIn, SOFT_SPRING } from "../../lib/motion/presets";
import { abrechnungTexts as t } from "../../texts/abrechnungTexts";
import { CARD, ICON_BUTTON } from "./abrechnungStyles";

interface MonthStepperProps {
  value: MonthRef;
  dir: number;
  atLatest: boolean;
  onPrev: () => void;
  onNext: () => void;
}

/** Monatswahl wie in v1; der neue Monat gleitet aus der Richtung herein, in die geblättert wurde. */
export default function MonthStepper({ value, dir, atLatest, onPrev, onNext }: MonthStepperProps) {
  const reduce = useReducedMotion();
  const shift = reduce ? 0 : 28 * dir;
  return (
    <motion.nav variants={riseIn} aria-label={t.monthNav} className={`${CARD} flex items-center justify-between rounded-2xl p-1`}>
      <button type="button" onClick={onPrev} className={ICON_BUTTON} aria-label={t.prevMonth}>
        <ChevronLeft className="h-5 w-5" />
      </button>
      <div className="relative h-7 flex-1 overflow-hidden text-center" aria-live="polite">
        <AnimatePresence initial={false} mode="popLayout" custom={shift}>
          <motion.h2
            key={monthKey(value)}
            className="absolute inset-0 text-base font-semibold text-slate-900 tabular-nums dark:text-white"
            initial={{ x: shift, opacity: 0, filter: "blur(4px)" }}
            animate={{ x: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{ x: -shift, opacity: 0, filter: "blur(4px)" }}
            transition={SOFT_SPRING}
          >
            {monthLabel(value)}
          </motion.h2>
        </AnimatePresence>
      </div>
      <button type="button" onClick={onNext} disabled={atLatest} className={ICON_BUTTON} aria-label={t.nextMonth}>
        <ChevronRight className="h-5 w-5" />
      </button>
    </motion.nav>
  );
}
