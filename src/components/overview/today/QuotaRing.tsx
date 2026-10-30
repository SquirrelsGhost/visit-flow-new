import { motion, useReducedMotion } from "motion/react";
import { useId } from "react";
import GlassNumber from "../../glass/GlassNumber";

interface QuotaRingProps {
  label: string;
  /** Prozent 0 bis 100. */
  value: number;
  /** Verlauf des Rings: Anfangs- und Endfarbe. */
  stops: readonly [string, string];
}

const SIZE = 64;
const RADIUS = 28;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const DRAW = { duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 } as const;

/** Quote als leuchtender Ring auf der tiefen Karte; der Ring zieht sich beim Erscheinen auf seinen Wert. */
export default function QuotaRing({ label, value, stops }: QuotaRingProps) {
  const gradientId = useId();
  const reduce = useReducedMotion();
  const offset = CIRCUMFERENCE * (1 - Math.max(0, Math.min(100, value)) / 100);
  return (
    <div className="flex min-w-0 items-center gap-3" role="img" aria-label={`${label}: ${value} %`}>
      <svg className="h-16 w-16 shrink-0 -rotate-90" viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={stops[0]} />
            <stop offset="100%" stopColor={stops[1]} />
          </linearGradient>
        </defs>
        <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" strokeWidth={5} className="stroke-white/10" />
        <motion.circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={5}
          strokeLinecap="round"
          stroke={`url(#${gradientId})`}
          strokeDasharray={CIRCUMFERENCE}
          initial={{ strokeDashoffset: reduce ? offset : CIRCUMFERENCE }}
          animate={{ strokeDashoffset: offset }}
          transition={reduce ? { duration: 0 } : DRAW}
          style={{ filter: `drop-shadow(0 0 6px ${stops[1]}66)` }}
        />
      </svg>
      <div className="min-w-0" aria-hidden>
        <GlassNumber value={value} kind="percent" className="text-[22px] font-semibold leading-none tracking-[-0.02em] text-white" />
        <p className="mt-1 text-[12px] font-medium leading-tight text-white/55">{label}</p>
      </div>
    </div>
  );
}
