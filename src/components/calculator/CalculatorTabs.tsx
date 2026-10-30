// Reiter mit gleitender Markierung (motion layoutId)
"use client";

import { BarChart3, Calculator } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../../lib/cn";
import { SNAPPY_SPRING } from "../../lib/motion/presets";
import type { CalcTab } from "../../hooks/useCalculatorSwipe";
import { calculatorTexts as t } from "../../texts/calculatorTexts";
import { CALC_PILL_RED } from "./calcGlass";

interface CalculatorTabsProps {
  active: CalcTab;
  onChange: (tab: CalcTab) => void;
}

const TABS = [
  { id: "pencil", label: t.tabPencil, Icon: BarChart3 },
  { id: "calc", label: t.tabCalc, Icon: Calculator },
] as const;

/** Die zwei Reiter als gläserne Segment-Steuerung wie in den Einstellungen; die rote Fläche gleitet zum aktiven Reiter. */
export default function CalculatorTabs({ active, onChange }: CalculatorTabsProps) {
  return (
    <div role="tablist" aria-label={t.tabsLabel} className="glass-surface mx-auto flex w-full max-w-5xl shrink-0 select-none gap-1 rounded-[22px] p-1.5">
      {TABS.map(({ id, label, Icon }) => {
        const selected = active === id;
        return (
          <motion.button
            key={id}
            type="button"
            role="tab"
            id={`calc-tab-${id}`}
            aria-selected={selected}
            aria-controls={`calc-panel-${id}`}
            onClick={() => onChange(id)}
            whileTap={{ scale: 0.97 }}
            className={cn(
              "relative flex h-11 flex-1 items-center justify-center rounded-2xl text-sm font-semibold tracking-wide transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40",
              selected ? "text-white" : "text-slate-500 hover:text-foreground dark:text-white/50 dark:hover:text-white",
            )}
          >
            {selected && <motion.span layoutId="calc-tab-pill" transition={SNAPPY_SPRING} className={CALC_PILL_RED} />}
            <span className="relative flex items-center gap-2">
              <Icon className="h-4 w-4" />
              {label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
