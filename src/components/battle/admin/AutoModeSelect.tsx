// Gleitende Markierung und Beschreibung, die weich wechselt
"use client";

import { AnimatePresence, motion } from "motion/react";
import { useId } from "react";
import { AUTO_MODES } from "../../../lib/battle/battleCategories";
import type { AutoAssignMode } from "../../../lib/battle/battleTypes";
import { cn } from "../../../lib/cn";
import { SNAPPY_SPRING } from "../../../lib/motion/presets";
import { battleAdminTexts as t } from "../../../texts/battleAdminTexts";
import { INSET } from "../battleStyles";

interface AutoModeSelectProps {
  mode: AutoAssignMode;
  onChange: (mode: AutoAssignMode) => void;
}

/** Modus der Auto-Zuweisung als 2×2-Auswahl; die weiße Pille gleitet zum gewählten Modus, darunter steht, wie gepaart wird. */
export default function AutoModeSelect({ mode, onChange }: AutoModeSelectProps) {
  const pillId = useId();
  const current = AUTO_MODES.find((m) => m.value === mode) ?? AUTO_MODES[0];
  return (
    <div className={cn(INSET, "p-1.5")}>
      <p className="px-2.5 pt-1.5 pb-2 text-[12px] font-medium text-slate-500 dark:text-neutral-400">{t.modeTitle}</p>
      <div role="radiogroup" aria-label={t.modeTitle} className="grid grid-cols-2 gap-1">
        {AUTO_MODES.map((m) => {
          const selected = m.value === mode;
          return (
            <button
              key={m.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(m.value)}
              className={cn(
                "relative min-h-11 rounded-xl px-3 py-2 text-left text-[13px] leading-tight font-medium transition-colors duration-300",
                selected ? "text-red-700 dark:text-white" : "text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-neutral-100",
              )}
            >
              {selected && (
                <motion.span
                  layoutId={pillId}
                  transition={SNAPPY_SPRING}
                  className="absolute inset-0 rounded-xl bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_6px_16px_-6px_rgba(220,38,38,0.25)] ring-1 ring-red-500/15 dark:bg-red-500/20 dark:ring-red-400/25"
                />
              )}
              <span className="relative">{m.label}</span>
            </button>
          );
        })}
      </div>
      <div className="relative h-9 overflow-hidden px-2.5">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={current.value}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="pt-2.5 text-[12px] text-slate-500 dark:text-neutral-400"
          >
            {current.description}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
