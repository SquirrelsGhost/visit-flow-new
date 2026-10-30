import { motion } from "motion/react";
import { cn } from "../../lib/cn";
import { windowShare } from "../../lib/expiring/expiringLogic";
import type { Urgency } from "../../lib/expiring/expiringTypes";
import { expiringTexts as t } from "../../texts/expiringTexts";
import { URGENCY_STYLE } from "./expiringStyles";

interface DaysRingProps {
  daysLeft: number;
  urgency: Urgency;
  window: number;
}

const R = 21;

/** Restlaufzeit als kleiner Ring: die Zahl in der Mitte, der Bogen schrumpft, je näher der Ablauf rückt. */
export default function DaysRing({ daysLeft, urgency, window }: DaysRingProps) {
  const style = URGENCY_STYLE[urgency];
  return (
    <span aria-hidden className="relative grid h-12 w-12 shrink-0 place-items-center">
      <svg viewBox="0 0 48 48" className="absolute inset-0 h-full w-full -rotate-90">
        <circle cx="24" cy="24" r={R} fill="none" strokeWidth="3.5" className="stroke-slate-900/[0.07] dark:stroke-white/[0.1]" />
        <motion.circle
          cx="24"
          cy="24"
          r={R}
          fill="none"
          strokeWidth="3.5"
          strokeLinecap="round"
          className={style.ring}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: Math.max(0.04, windowShare(daysLeft, window)) }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        />
      </svg>
      <span className="flex flex-col items-center leading-none">
        <span className={cn("text-[15px] font-bold tabular-nums tracking-[-0.02em]", style.text)}>{Math.max(0, daysLeft)}</span>
        <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{t.daysShort(daysLeft)}</span>
      </span>
    </span>
  );
}
