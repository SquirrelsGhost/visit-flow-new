import { motion } from "motion/react";
import AnimatedEuro from "../../ui/AnimatedEuro";
import { CALC_TILE } from "../calcGlass";

interface PriceCardProps {
  label: string;
  value: number;
  suffix?: string;
}

/** Preiskachel eines Laufzeit-Abschnitts; erscheint weich und zählt Beträge mit. */
export default function PriceCard({ label, value, suffix = "" }: PriceCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={`${CALC_TILE} overflow-hidden p-3.5`}
    >
      <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--glass-label)]">{label}</div>
      <AnimatedEuro value={value} suffix={suffix} className="mt-1 block text-[18px] font-semibold tracking-[-0.02em] tabular-nums" />
    </motion.div>
  );
}
