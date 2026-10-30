import { motion } from "motion/react";
import { cn } from "../../../lib/cn";
import { SNAPPY_SPRING } from "../../../lib/motion/presets";

export interface MiniOption<T extends string> {
  id: T;
  label: string;
  count?: number;
}

interface MiniToggleProps<T extends string> {
  label: string;
  options: readonly MiniOption<T>[];
  active: T;
  onChange: (id: T) => void;
  layoutId: string;
}

/** Kleiner Umschalter im Kopf einer Karte (z. B. Offen | Alle); die helle Pille gleitet zur Wahl. */
export default function MiniToggle<T extends string>({ label, options, active, onChange, layoutId }: MiniToggleProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className="flex gap-0.5 rounded-full bg-[var(--glass-track)] p-0.5">
      {options.map((o) => {
        const selected = o.id === active;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(o.id)}
            className={cn("relative rounded-full px-3 py-1 text-[12px] font-semibold transition-colors duration-200", selected ? "text-foreground" : "text-slate-500 hover:text-foreground dark:text-white/50")}
          >
            {selected && <motion.span layoutId={layoutId} transition={SNAPPY_SPRING} className="absolute inset-0 rounded-full bg-white shadow-[0_1px_2px_rgba(15,23,42,0.1)] dark:bg-white/[0.14]" />}
            <span className="relative">
              {o.label}
              {o.count !== undefined && <span className="ml-1 tabular-nums opacity-55">{o.count}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}
