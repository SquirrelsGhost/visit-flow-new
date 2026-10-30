import { motion } from "motion/react";
import { useId, type ReactNode } from "react";
import { cn } from "../../lib/cn";

type GlassRingTone = "red" | "green" | "amber";

interface GlassRingProps {
  /** Anteil 0 bis 1; darüber bleibt der Ring voll. */
  share: number;
  tone?: GlassRingTone;
  /** Durchmesser in px. */
  size?: number;
  label: string;
  /** Inhalt in der Mitte (Prozent, Symbol). */
  children?: ReactNode;
  className?: string;
}

const STOPS: Record<GlassRingTone, [string, string, string]> = {
  red: ["#fda4af", "#f43f5e", "rgba(244,63,94,0.55)"],
  green: ["#6ee7b7", "#10b981", "rgba(16,185,129,0.5)"],
  amber: ["#fde68a", "#f59e0b", "rgba(245,158,11,0.55)"],
};
const R = 52;
const FILL = { duration: 1.3, ease: [0.16, 1, 0.3, 1], delay: 0.25 } as const;

/**
 * Fortschrittsring mit Verlauf und weichem Schein: skaliert für jede Menge (1 oder 500 Plätze),
 * füllt sich beim Erscheinen und gleitet bei Änderungen zum neuen Wert.
 */
export default function GlassRing({ share, tone = "red", size = 128, label, children, className }: GlassRingProps) {
  const id = useId();
  const [from, to, glow] = STOPS[tone];
  const value = Math.max(0, Math.min(1, share));
  return (
    <div role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(share * 100)} className={cn("relative shrink-0", className)} style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" style={{ filter: `drop-shadow(0 0 10px ${glow})` }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r={R} fill="none" strokeWidth="9" className="stroke-slate-900/[0.07] dark:stroke-white/[0.1]" />
        <motion.circle cx="60" cy="60" r={R} fill="none" stroke={`url(#${id})`} strokeWidth="9" strokeLinecap="round" opacity={value > 0 ? 1 : 0} initial={{ pathLength: 0 }} animate={{ pathLength: value }} transition={FILL} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}
