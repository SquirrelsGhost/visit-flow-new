// Zahl wechselt mit kurzer Blende nach oben/unten
"use client";

import { Minus, Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { CATEGORY_ICONS, CATEGORY_NAMES } from "../../../lib/battle/battleCategories";
import { cn } from "../../../lib/cn";
import { battleAdminTexts as t } from "../../../texts/battleAdminTexts";

interface PointRowProps {
  category: string;
  value: number;
  fallback: number;
  onChange: (value: number) => void;
}

const MIN = 0;
const MAX = 10;
const STEP =
  "flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-[background-color,color,transform] duration-200 hover:bg-red-500/10 hover:text-red-600 active:scale-90 disabled:opacity-30 disabled:hover:bg-transparent dark:text-neutral-400 dark:hover:text-red-300";

/** Eine Kategorie mit Punkten pro Sale: Symbol, Name, Stepper − n +. Abweichungen vom Standard sind rot markiert. */
export default function PointRow({ category, value, fallback, onChange }: PointRowProps) {
  // Richtung der Zahl-Blende: beim Erhöhen von unten, beim Senken von oben
  const [prev, setPrev] = useState(value);
  const [dir, setDir] = useState(1);
  if (prev !== value) {
    setPrev(value);
    setDir(value > prev ? 1 : -1);
  }
  const name = CATEGORY_NAMES[category] || category;
  const changed = value !== fallback;
  return (
    <li className="flex items-center gap-3 px-3.5 py-2.5">
      <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-card text-base shadow-[0_1px_2px_rgba(15,23,42,0.06)] ring-1 ring-slate-200/70 dark:bg-white/5 dark:ring-white/10">
        {CATEGORY_ICONS[category] || "•"}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-slate-900 dark:text-white">{name}</span>
        <span className={cn("block text-[11px] transition-colors duration-300", changed ? "text-red-600 dark:text-red-300" : "text-slate-400 dark:text-neutral-500")}>
          {changed ? `${t.pointsDefault}: ${fallback}` : t.pointsPerSale}
        </span>
      </span>
      <div className="flex items-center gap-0.5 rounded-full bg-card p-0.5 shadow-[0_1px_2px_rgba(15,23,42,0.06)] ring-1 ring-slate-200/70 dark:bg-white/5 dark:ring-white/10">
        <button type="button" aria-label={`${name}: ${t.pointsLess}`} disabled={value <= MIN} onClick={() => onChange(value - 1)} className={STEP}>
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span aria-live="polite" className={cn("relative h-6 w-7 overflow-hidden text-center text-[15px] font-semibold tabular-nums", changed ? "text-red-600 dark:text-red-300" : "text-slate-900 dark:text-white")}>
          <AnimatePresence initial={false} custom={dir}>
            <motion.span
              key={value}
              custom={dir}
              initial={{ y: dir * 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: dir * -14, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 leading-6"
            >
              {value}
            </motion.span>
          </AnimatePresence>
        </span>
        <button type="button" aria-label={`${name}: ${t.pointsMore}`} disabled={value >= MAX} onClick={() => onChange(value + 1)} className={STEP}>
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </li>
  );
}
