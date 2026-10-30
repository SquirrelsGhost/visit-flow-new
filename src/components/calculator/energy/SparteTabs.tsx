// Gleitende Markierung der aktiven Sparte
"use client";

import { Flame, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "../../../lib/cn";
import type { Sparte } from "../../../lib/energy/energyCalc";
import { SPARTEN } from "../../../lib/energy/energyState";
import { SNAPPY_SPRING } from "../../../lib/motion/presets";
import { energyTexts as t } from "../../../texts/energyTexts";
import { CALC_PILL, CALC_TRACK } from "../calcGlass";
import { FARBE } from "./energyStyles";

interface SparteTabsProps {
  aktiv: Sparte;
  onChange: (s: Sparte) => void;
  gefuellt: (s: Sparte) => boolean;
}

/** Strom oder Gas. Ein grüner Punkt zeigt, dass die Sparte fertig gerechnet ist. */
export default function SparteTabs({ aktiv, onChange, gefuellt }: SparteTabsProps) {
  return (
    <div role="tablist" className={CALC_TRACK}>
      {SPARTEN.map((sparte) => {
        const Icon = sparte === "strom" ? Zap : Flame;
        const an = aktiv === sparte;
        return (
          <button
            key={sparte}
            type="button"
            role="tab"
            aria-selected={an}
            onClick={() => onChange(sparte)}
            className={cn(
              "relative flex h-11 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40",
              an ? "text-foreground" : "text-slate-500 hover:text-foreground dark:text-white/50 dark:hover:text-white",
            )}
          >
            {an && (
              <motion.span layoutId="energy-sparte" transition={SNAPPY_SPRING} className={CALC_PILL} />
            )}
            <Icon className={cn("relative h-4 w-4", an && FARBE[sparte].text)} />
            <span className="relative">{t.sparte[sparte]}</span>
            <AnimatePresence>
              {gefuellt(sparte) && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={SNAPPY_SPRING}
                  className="absolute right-3 top-3 h-2 w-2 rounded-full bg-emerald-400"
                  aria-label={t.filled}
                />
              )}
            </AnimatePresence>
          </button>
        );
      })}
    </div>
  );
}
