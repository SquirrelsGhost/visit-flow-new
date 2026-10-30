import { motion } from "motion/react";
import { cn } from "../../lib/cn";
import { GLASS_TONES, type GlassTone } from "../../lib/glass/glassTones";

interface GlassProgressProps {
  /** Anteil 0 bis 1. */
  share: number;
  label: string;
  tone?: GlassTone;
  /** Für Screenreader: aktueller und höchster Wert. */
  now: number;
  max: number;
  className?: string;
}

const FILL = { duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.2 } as const;

/** Feiner Fortschrittsbalken, der weich auf seinen Wert wächst und an der Spitze leuchtet. */
export default function GlassProgress({ share, label, tone = "red", now, max, className }: GlassProgressProps) {
  return (
    <span role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={now} className={cn("block h-1.5 overflow-hidden rounded-full bg-[var(--glass-track)]", className)}>
      <motion.span
        className={cn("block h-full origin-left rounded-full bg-gradient-to-r shadow-[0_0_12px_rgba(255,255,255,0.35)]", GLASS_TONES[tone].bar)}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: Math.max(0, Math.min(1, share)) }}
        transition={FILL}
      />
    </span>
  );
}
