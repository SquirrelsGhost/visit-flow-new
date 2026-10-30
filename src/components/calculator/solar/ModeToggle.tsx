// Gleitende Markierung zwischen Miete und Kauf
"use client";

import { motion } from "motion/react";
import { useId } from "react";
import { cn } from "../../../lib/cn";
import { SNAPPY_SPRING } from "../../../lib/motion/presets";
import { CALC_PILL, CALC_TRACK } from "../calcGlass";

interface ModeToggleProps<T extends string> {
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  /** "strong": grüne Markierung (Miete/Kauf), "soft": helle Markierung (Zahlungsweise) */
  tone?: "strong" | "soft";
}

/** Zwei Knöpfe mit gleitender Markierung (v1 Miet-/Kaufmodell und Direktkauf/Finanzierung). */
export default function ModeToggle<T extends string>({ options, value, onChange, tone = "strong" }: ModeToggleProps<T>) {
  const pill = useId();
  const strong = tone === "strong";
  return (
    <div role="radiogroup" className={cn(CALC_TRACK, "shrink-0")}>
      {options.map((o) => {
        const active = o.id === value;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.id)}
            className={cn(
              "relative rounded-xl font-semibold transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40",
              strong ? "h-10 px-5 text-[13px]" : "h-8 px-3 text-[12px]",
              active ? "text-foreground" : "text-slate-500 hover:text-foreground dark:text-white/50 dark:hover:text-white",
            )}
          >
            {active && (
              <motion.span
                layoutId={pill}
                transition={SNAPPY_SPRING}
                className={CALC_PILL}
              />
            )}
            <span className="relative">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
