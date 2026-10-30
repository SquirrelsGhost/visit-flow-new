import { motion, useReducedMotion } from "motion/react";
import type { SummaryTone } from "../../lib/abrechnung/abrechnungSummary";
import { abrechnungTexts as t } from "../../texts/abrechnungTexts";
import AnimatedNumber from "../assistant/me/AnimatedNumber";

interface PayoutRingProps {
  rate: number;
  tone: SummaryTone;
}

const R = 34;
const STROKE = { ok: "url(#ring-ok)", missing: "url(#ring-missing)", extra: "url(#ring-extra)" } as const;

/** Ring mit der Auszahlungsquote; zeichnet sich beim Erscheinen weich bis zum Wert. */
export default function PayoutRing({ rate, tone }: PayoutRingProps) {
  const reduce = useReducedMotion();
  return (
    <div className="relative grid h-[88px] w-[88px] shrink-0 place-items-center" role="img" aria-label={`${t.payoutRate} ${Math.round(rate * 100)} %`}>
      <svg viewBox="0 0 80 80" className="absolute inset-0 -rotate-90">
        <defs>
          <linearGradient id="ring-ok" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="ring-missing" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fb7185" />
            <stop offset="100%" stopColor="#e11d48" />
          </linearGradient>
          <linearGradient id="ring-extra" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>
        <circle cx="40" cy="40" r={R} fill="none" strokeWidth="7" className="stroke-slate-100 dark:stroke-white/[0.07]" />
        <motion.circle
          cx="40"
          cy="40"
          r={R}
          fill="none"
          strokeWidth="7"
          strokeLinecap="round"
          stroke={STROKE[tone]}
          initial={{ pathLength: reduce ? rate : 0 }}
          animate={{ pathLength: rate }}
          transition={reduce ? { duration: 0 } : { duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        />
      </svg>
      <div className="text-center leading-none">
        <span className="text-lg font-bold text-slate-900 tabular-nums dark:text-white">
          <AnimatedNumber value={Math.round(rate * 100)} />
          <span className="text-xs font-semibold">%</span>
        </span>
        <span className="mt-1 block text-[9px] font-semibold tracking-wider text-slate-400 uppercase dark:text-neutral-500">Quote</span>
      </div>
    </div>
  );
}
