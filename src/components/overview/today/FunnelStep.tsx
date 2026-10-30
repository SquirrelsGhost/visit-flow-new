import { motion } from "motion/react";
import { cn } from "../../../lib/cn";
import GlassNumber from "../../glass/GlassNumber";

interface FunnelStepProps {
  label: string;
  count: number;
  /** Breite der Stufe 0 bis 1, gemessen an allen Türen. */
  share: number;
  /** Verlaufsklassen der Stufe. */
  tone: string;
  delay: number;
}

/** Auch eine schmale Stufe bleibt breit genug für Name und Zahl. */
const MIN_WIDTH = 0.46;
const GROW = { duration: 1, ease: [0.16, 1, 0.3, 1] } as const;

/** Eine Stufe des Trichters: Balken, der auf seinen Anteil wächst, Name links und Zahl rechts darin. */
export default function FunnelStep({ label, count, share, tone, delay }: FunnelStepProps) {
  const width = `${Math.max(share, MIN_WIDTH) * 100}%`;
  return (
    <div className="flex justify-center">
      <motion.div
        className={cn("flex h-11 items-center justify-between gap-2 rounded-2xl bg-gradient-to-r px-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_10px_22px_-14px_rgba(15,23,42,0.6)]", tone)}
        initial={{ width: `${MIN_WIDTH * 100}%`, opacity: 0 }}
        animate={{ width, opacity: 1 }}
        transition={{ ...GROW, delay }}
      >
        <span className="truncate text-[13px] font-semibold">{label}</span>
        <GlassNumber value={count} duration={0.9} className="text-[15px] font-semibold" />
      </motion.div>
    </div>
  );
}
