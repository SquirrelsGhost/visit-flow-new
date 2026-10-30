import { Check } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../../../lib/cn";
import { SNAPPY_SPRING } from "../../../lib/motion/presets";
import { GLASS_CARD, GLASS_DIVIDER, GLASS_ROW, GLASS_ROW_INTERACTIVE, GLASS_SUBTITLE, GLASS_TITLE } from "../../glass/glassStyles";

export interface PickOption {
  id: string;
  title: string;
  subtitle?: string;
}

interface ContestPickListProps {
  label: string;
  options: readonly PickOption[];
  selected: readonly string[];
  onChange: (ids: string[]) => void;
}

/** Mehrfachauswahl als Glas-Zeilen mit runder Haken-Marke. */
export default function ContestPickList({ label, options, selected, onChange }: ContestPickListProps) {
  const toggle = (id: string) => onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  return (
    <div role="group" aria-label={label} className={cn(GLASS_CARD, GLASS_DIVIDER, "max-h-72 overflow-y-auto")}>
      {options.map((option) => {
        const on = selected.includes(option.id);
        return (
          <button key={option.id} type="button" role="checkbox" aria-checked={on} onClick={() => toggle(option.id)} className={cn(GLASS_ROW, GLASS_ROW_INTERACTIVE, "min-h-[3.25rem] py-2.5")}>
            <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-1 ring-inset transition-colors duration-300", on ? "bg-gradient-to-b from-red-500 to-red-600 ring-white/25" : "ring-[var(--glass-divider)]")}>
              {on && (
                <motion.span initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={SNAPPY_SPRING}>
                  <Check aria-hidden className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                </motion.span>
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className={cn(GLASS_TITLE, "truncate")}>{option.title}</span>
              {option.subtitle && <span className={cn(GLASS_SUBTITLE, "truncate")}>{option.subtitle}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}
