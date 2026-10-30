import { motion } from "motion/react";
import { cn } from "../../lib/cn";

interface SeatBarProps {
  used: number;
  total: number;
  label: string;
}

/** Bis zu so vielen Lizenzen zeigt die Leiste einzelne Plätze, darüber einen durchgehenden Balken. */
const MAX_SEGMENTS = 20;
const EASE = [0.22, 1, 0.36, 1] as const;

/** Belegte Lizenz-Plätze: Segmente füllen sich nacheinander, wie Plätze, die besetzt werden. */
export default function SeatBar({ used, total, label }: SeatBarProps) {
  const base = "h-2 rounded-full";
  if (total > MAX_SEGMENTS) {
    return (
      <div role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={total} aria-valuenow={used} className={cn(base, "overflow-hidden bg-white/15")}>
        <motion.div className={cn(base, "origin-left bg-gradient-to-r from-red-400 to-rose-300")} initial={{ scaleX: 0 }} animate={{ scaleX: used / total }} transition={{ duration: 1, ease: EASE, delay: 0.2 }} />
      </div>
    );
  }
  return (
    <div role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={total} aria-valuenow={used} className="flex gap-1">
      {Array.from({ length: total }, (_, index) => (
        <motion.span
          key={index}
          className={cn(base, "flex-1", index < used ? "bg-gradient-to-r from-red-400 to-rose-300 shadow-[0_0_10px_rgba(248,113,113,0.45)]" : "bg-white/15")}
          initial={{ opacity: 0, scaleY: 0.4 }}
          animate={{ opacity: 1, scaleY: 1 }}
          transition={{ duration: 0.35, ease: EASE, delay: 0.2 + index * 0.04 }}
        />
      ))}
    </div>
  );
}
