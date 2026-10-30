import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { SOFT_SPRING } from "../../lib/motion/presets";

interface LogbookMonthSwitchProps {
  label: string;
  /** Richtung des letzten Blätterns, damit der neue Monat von dort hereingleitet. */
  dir: number;
  atLatest: boolean;
  onPrev: () => void;
  onNext: () => void;
  navLabel: string;
  prevLabel: string;
  nextLabel: string;
}

const BUTTON =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.08] text-white/80 ring-1 ring-inset ring-white/10 transition-[background-color,transform] duration-200 hover:bg-white/[0.14] active:scale-95 disabled:opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/60";

/** Monatswahl in der Kopfkarte: Pfeile links und rechts, der Monatsname gleitet weich herein. */
export default function LogbookMonthSwitch({ label, dir, atLatest, onPrev, onNext, navLabel, prevLabel, nextLabel }: LogbookMonthSwitchProps) {
  const reduce = useReducedMotion();
  const shift = reduce ? 0 : 22 * dir;
  return (
    <nav aria-label={navLabel} className="flex min-w-0 items-center gap-2">
      <button type="button" onClick={onPrev} aria-label={prevLabel} className={BUTTON}>
        <ChevronLeft aria-hidden className="h-4 w-4" />
      </button>
      <div className="relative h-6 min-w-[8.5rem] flex-1 overflow-hidden" aria-live="polite">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.h2
            key={label}
            className="absolute inset-0 truncate text-center text-[15px] font-semibold tracking-[-0.01em] text-white"
            initial={{ x: shift, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -shift, opacity: 0 }}
            transition={SOFT_SPRING}
          >
            {label}
          </motion.h2>
        </AnimatePresence>
      </div>
      <button type="button" onClick={onNext} disabled={atLatest} aria-label={nextLabel} className={BUTTON}>
        <ChevronRight aria-hidden className="h-4 w-4" />
      </button>
    </nav>
  );
}
