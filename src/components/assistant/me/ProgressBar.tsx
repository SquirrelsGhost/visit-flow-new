import { motion } from "motion/react";
import { cn } from "../../../lib/cn";

interface ProgressBarProps {
  value: number;
  /** Farbe der Spur. */
  track: string;
  /** Verlauf der Füllung, z. B. "from-amber-500 to-orange-500". */
  fill: string;
  className?: string;
  label?: string;
}

/** Fortschrittsbalken, der beim Erscheinen weich vollläuft. */
export default function ProgressBar({ value, track, fill, className, label }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      aria-label={label}
      className={cn("h-2 w-full overflow-hidden rounded-full", track, className)}
    >
      <motion.div
        className={cn("h-full rounded-full bg-gradient-to-r", fill)}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
      />
    </div>
  );
}
