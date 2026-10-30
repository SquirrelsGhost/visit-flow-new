import { motion, useReducedMotion } from "motion/react";
import GlassAvatar from "../glass/GlassAvatar";
import { useId } from "react";
import { TIER_BADGE, TIER_STOPS } from "../../lib/profile/tierStyles";
import type { TierLevel, XpProgress } from "../../lib/profile/profileTypes";

interface XpRingProps {
  initial: string;
  xp: XpProgress | null | undefined;
  tier: TierLevel;
  label: string;
}

const SIZE = 120;
const RADIUS = 55;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const DRAW = { duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.25 } as const;

/** Avatar im leuchtenden XP-Ring wie v1 (auf der tiefen Kopfkarte): der Ring füllt sich bis zum Fortschritt im Level, unten rechts die Level-Plakette. */
export default function XpRing({ initial, xp, tier, label }: XpRingProps) {
  const gradientId = useId();
  const reduce = useReducedMotion();
  const share = xp && xp.next > 0 ? Math.min(1, xp.current / xp.next) : 0;
  const offset = CIRCUMFERENCE * (1 - share);
  const [from, to] = TIER_STOPS[tier];

  return (
    <div className="relative h-[120px] w-[120px]" role="img" aria-label={label}>
      <svg className="h-full w-full -rotate-90" viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
        <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" strokeWidth={4} className="stroke-white/10" />
        {xp && (
          <motion.circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            strokeWidth={4}
            strokeLinecap="round"
            stroke={`url(#${gradientId})`}
            strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: reduce ? offset : CIRCUMFERENCE }}
            animate={{ strokeDashoffset: offset }}
            transition={reduce ? { duration: 0 } : DRAW}
          />
        )}
      </svg>
      <GlassAvatar initial={initial} size="xl" className="absolute inset-[10px]" />
      {xp && (
        <span className={`absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-bold shadow-md ring-[3px] ring-[#12141f] ${TIER_BADGE[tier]}`}>
          {xp.level}
        </span>
      )}
    </div>
  );
}
