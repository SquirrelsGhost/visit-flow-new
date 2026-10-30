import { motion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { SNAPPY_SPRING } from "../../lib/motion/presets";
import { GLASS_TONES, type GlassTone } from "../../lib/glass/glassTones";
import { CHIP, CHIP_IDLE, CHIP_PILL } from "./simulatorStyles";

interface ChoiceChipProps {
  selected: boolean;
  tone: GlassTone;
  /** Gleiche Gruppe = gleiche Kennung; die farbige Fläche gleitet dann zwischen den Chips */
  pillId: string;
  onSelect: () => void;
  children: ReactNode;
  className?: string;
  role?: "radio" | "tab";
}

/** Auswahl-Chip (Monat, Level, Kategorie, Stufe). Gewählt: farbige Fläche in der Farbe der Gruppe. */
export default function ChoiceChip({ selected, tone, pillId, onSelect, children, className, role = "radio" }: ChoiceChipProps) {
  const ariaState = role === "tab" ? { "aria-selected": selected } : { "aria-checked": selected };
  return (
    <motion.button
      type="button"
      role={role}
      {...ariaState}
      onClick={onSelect}
      whileTap={{ scale: 0.95 }}
      className={cn(CHIP, selected ? "text-white" : CHIP_IDLE, className)}
    >
      {selected && <motion.span layoutId={pillId} transition={SNAPPY_SPRING} className={cn(CHIP_PILL, GLASS_TONES[tone].bar)} />}
      <span className="relative inline-flex flex-col items-center gap-1 leading-tight">{children}</span>
    </motion.button>
  );
}
