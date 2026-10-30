import { motion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { hapticFeedback } from "../../lib/device/haptics";
import { SNAPPY_SPRING } from "../../lib/motion/presets";

interface MapControlButtonProps {
  label: string;
  onClick: () => void;
  children: ReactNode;
  /** Kleiner Text unter dem Symbol wie in v1 ("Sat", "Karte", "Lasso", "3D"). */
  caption?: string;
  /** Farbton des Knopfes. */
  tone?: "glass" | "brand" | "active" | "purple";
}

const TONES = {
  glass: "glass-surface glass-blur text-slate-800 dark:text-white",
  brand: "bg-gradient-to-b from-red-500 to-red-600 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_10px_24px_-10px_rgba(220,38,38,0.8)]",
  active: "bg-gradient-to-b from-sky-500 to-blue-600 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_10px_24px_-10px_rgba(37,99,235,0.8)]",
  purple: "bg-purple-600 text-white ring-2 ring-purple-400 shadow-purple-900/30",
} as const;

/** Runder Kartenknopf aus v1 (12×12, rund, Glas). Federt beim Antippen und hebt sich beim Überfahren. */
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
        "flex h-12 w-12 flex-col items-center justify-center rounded-full transition-colors duration-300",
        TONES[tone],
      )}
    >
      {children}
      {caption && <span className="mt-0.5 text-[8px] font-bold">{caption}</span>}
    </motion.button>
  );
}
