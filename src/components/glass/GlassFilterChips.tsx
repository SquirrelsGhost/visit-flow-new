import { motion } from "motion/react";
import { cn } from "../../lib/cn";
import { SNAPPY_SPRING } from "../../lib/motion/presets";
import { GLASS_CHIP_ROW } from "./glassStyles";

export interface GlassFilterOption<T extends string> {
  id: T;
  label: string;
  count?: number;
}

interface GlassFilterChipsProps<T extends string> {
  options: readonly GlassFilterOption<T>[];
  active: T;
  onChange: (id: T) => void;
  label: string;
  /** Eindeutiger Name für die gleitende Markierung, wenn mehrere Leisten auf einer Seite stehen. */
  layoutId: string;
}

const CHIP = "relative flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40";

/** Filter als waagrecht scrollende Plaketten; die rote Markierung gleitet zum gewählten Filter. */
export default function GlassFilterChips<T extends string>({ options, active, onChange, label, layoutId }: GlassFilterChipsProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className={GLASS_CHIP_ROW}>
      {options.map((option) => {
        const selected = option.id === active;
        return (
          <button key={option.id} type="button" role="radio" aria-checked={selected} onClick={() => onChange(option.id)} className={cn(CHIP, selected ? "text-white" : "glass-surface text-slate-600 hover:text-foreground dark:text-white/65")}>
            {selected && <motion.span layoutId={layoutId} transition={SNAPPY_SPRING} className="absolute inset-0 rounded-full bg-gradient-to-b from-red-500 to-red-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_8px_20px_-8px_rgba(220,38,38,0.75)]" />}
            <span className="relative">{option.label}</span>
            {option.count !== undefined && <span className={cn("relative tabular-nums", selected ? "text-white/75" : "text-slate-400 dark:text-white/40")}>{option.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
