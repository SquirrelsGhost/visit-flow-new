// Gleitende Markierung der gewählten Option
"use client";

import { motion } from "motion/react";
import { useId } from "react";
import { cn } from "../../../lib/cn";
import { SNAPPY_SPRING } from "../../../lib/motion/presets";
import { CALC_PILL, CALC_TRACK } from "../calcGlass";

interface SegmentedProps<T extends string | number> {
  werte: { wert: T; label: string }[];
  wert: T;
  onChange: (w: T) => void;
  /** Veraltet: die Markierung ist im Glas-Design überall gleich. */
  aktivKlasse?: string;
  label?: string;
}

/** Zwei bis fünf gleichwertige Knöpfe in einer Reihe (v1 Umschalter) als gläserne Segment-Steuerung; die weiße Fläche gleitet zur Auswahl. */
export default function Segmented<T extends string | number>({ werte, wert, onChange, label }: SegmentedProps<T>) {
  const pill = useId();
  return (
    <div role="radiogroup" aria-label={label} className={CALC_TRACK}>
      {werte.map((w) => {
        const aktiv = w.wert === wert;
        return (
          <button
            key={String(w.wert)}
            type="button"
            role="radio"
            aria-checked={aktiv}
            onClick={() => onChange(w.wert)}
            className={cn(
              "relative h-10 flex-1 rounded-xl px-2 text-[13px] font-semibold transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40",
              aktiv ? "text-foreground" : "text-slate-500 hover:text-foreground dark:text-white/50 dark:hover:text-white",
            )}
          >
            {aktiv && (
              <motion.span layoutId={pill} transition={SNAPPY_SPRING} className={CALC_PILL} />
            )}
            <span className="relative">{w.label}</span>
          </button>
        );
      })}
    </div>
  );
}
