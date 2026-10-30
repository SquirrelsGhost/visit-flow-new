import { motion } from "motion/react";
import { cn } from "../../lib/cn";
import { SNAPPY_SPRING } from "../../lib/motion/presets";
import { abrechnungTexts as t } from "../../texts/abrechnungTexts";

export type Range = 6 | 12;

const RANGES: readonly Range[] = [6, 12];

interface RangeToggleProps {
  value: Range;
  onChange: (range: Range) => void;
}

/** Zeitraum des Verlaufs; die Markierung gleitet zum gewählten Wert. */
export default function RangeToggle({ value, onChange }: RangeToggleProps) {
  return (
    <div role="radiogroup" aria-label={t.trendTitle} className="flex shrink-0 rounded-xl bg-slate-100 p-0.5 dark:bg-white/[0.05]">
      {RANGES.map((r) => (
        <button
          key={r}
          type="button"
          role="radio"
          aria-checked={value === r}
          onClick={() => onChange(r)}
          className={cn("relative h-8 rounded-[10px] px-3 text-xs font-semibold transition-colors", value === r ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-neutral-400")}
        >
          {value === r && <motion.span layoutId="abr-range" transition={SNAPPY_SPRING} className="absolute inset-0 rounded-[10px] bg-white shadow-sm dark:bg-white/[0.12]" />}
          <span className="relative">{t.range[r]}</span>
        </button>
      ))}
    </div>
  );
}
