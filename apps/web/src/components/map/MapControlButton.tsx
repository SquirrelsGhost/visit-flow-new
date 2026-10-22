import { motion } from "motion/react";
import type { ReactNode } from "react";
import { hapticFeedback } from "../../lib/device/haptics";
import { SNAPPY_SPRING } from "../../lib/motion/presets";
import { cn } from "../../lib/cn";

interface MapControlButtonProps {
  label: string;
  onClick: () => void;
  children: ReactNode;
  /** Kleiner Text unter dem Symbol wie in v1 ("Sat", "Karte"). */
  caption?: string;
  /** Kräftig gefärbter Knopf (Standort) statt Glas. */
  tone?: "glass" | "brand" | "active";
}

const TONES = {
  glass: "border border-slate-200 bg-white/80 text-slate-800 dark:border-white/10 dark:bg-black/55 dark:text-white",
  brand: "bg-[#e2001a] text-white shadow-red-900/30",
  active: "bg-blue-700 text-white shadow-blue-900/30",
} as const;

/** Runder Kartenknopf aus v1 (12×12, rounded-2xl, Glas). Federt beim Antippen und hebt sich beim Überfahren. */
export default function MapControlButton({ label, onClick, children, caption, tone = "glass" }: MapControlButtonProps) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      onClick={() => {
        hapticFeedback("light");
        onClick();
      }}
      variants={{ hidden: { opacity: 0, x: 24, scale: 0.8 }, show: { opacity: 1, x: 0, scale: 1, transition: SNAPPY_SPRING } }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.9 }}
      className={cn(
        "flex h-12 w-12 flex-col items-center justify-center rounded-2xl shadow-lg backdrop-blur transition-colors duration-300",
        TONES[tone],
      )}
    >
      {children}
      {caption && <span className="mt-0.5 text-[8px] font-bold">{caption}</span>}
    </motion.button>
  );
}
