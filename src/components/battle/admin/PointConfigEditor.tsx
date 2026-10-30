// Hinweis auf ungespeicherte Änderungen blendet ein und aus
"use client";

import { Check, Loader2, RotateCcw } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { useBattlePoints } from "../../../hooks/useBattlePoints";
import { cn } from "../../../lib/cn";
import { battleAdminTexts as t } from "../../../texts/battleAdminTexts";
import { INSET } from "../battleStyles";
import PointRow from "./PointRow";

interface PointConfigEditorProps {
  points: ReturnType<typeof useBattlePoints>;
}

const ACTION = "inline-flex h-10 items-center justify-center gap-1.5 rounded-xl px-4 text-[13px] font-semibold transition-[background-color,box-shadow,opacity,transform] duration-300 active:scale-[0.97] disabled:opacity-50";

/** Bonuspunkte pro Kategorie als Liste mit Steppern (0–10). Speichern leuchtet erst, wenn sich etwas geändert hat. */
export default function PointConfigEditor({ points }: PointConfigEditorProps) {
  const categories = Object.keys(points.config);
  return (
    <div className="space-y-3">
      <ul className={cn(INSET, "divide-y divide-slate-200/70 dark:divide-white/[0.06]")}>
        {categories.map((cat) => (
          <PointRow key={cat} category={cat} value={points.config[cat] ?? 1} fallback={points.defaults[cat] ?? 1} onChange={(v) => points.setPoints(cat, v)} />
        ))}
      </ul>
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1 px-1">
          <AnimatePresence initial={false}>
            {points.dirty && (
              <motion.p
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                className="flex items-center gap-1.5 text-[12px] font-medium text-red-600 dark:text-red-300"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                <span className="truncate">{t.pointsDirty}</span>
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        <button type="button" onClick={points.reset} aria-label={t.pointsReset} title={t.pointsReset} className={cn(ACTION, "px-3 text-slate-500 hover:bg-slate-100 dark:text-neutral-400 dark:hover:bg-white/5")}>
          <RotateCcw className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={points.save}
          disabled={points.saving || !points.dirty}
          className={cn(
            ACTION,
            points.dirty
              ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-[0_10px_24px_-10px_rgba(220,38,38,0.75)]"
              : "bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-neutral-500",
          )}
        >
          {points.saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} {t.pointsSave}
        </button>
      </div>
    </div>
  );
}
