// Verlaufseinträge blenden weich ein und aus
"use client";

import { Clock, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { HistoryEntry } from "../../hooks/useCalculatorState";
import { formatResult } from "../../lib/calculator/calcEngine";
import { SOFT_SPRING } from "../../lib/motion/presets";
import { calculatorTexts as t } from "../../texts/calculatorTexts";

interface CalculatorHistoryProps {
  history: HistoryEntry[];
  onRecall: (entry: HistoryEntry) => void;
  onClear: () => void;
}

/** Die letzten fünf Rechnungen (v1). Ein Tipp übernimmt das Ergebnis wieder in die Rechnung. */
export default function CalculatorHistory({ history, onRecall, onClear }: CalculatorHistoryProps) {
  return (
    <AnimatePresence initial={false}>
      {history.length > 0 && (
        <motion.div
          key="history"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={SOFT_SPRING}
          className="overflow-hidden rounded-2xl bg-[var(--glass-track)]"
        >
          <div className="flex items-center justify-between px-3 py-1.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
              <Clock className="h-3 w-3" />
              <span>{t.history}</span>
            </div>
            <button
              type="button"
              onClick={onClear}
              aria-label={t.clearHistory}
              className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
          <ul className="flex flex-col divide-y divide-[var(--glass-divider)]">
            <AnimatePresence initial={false}>
              {history.map((entry, i) => (
                <motion.li
                  key={`${history.length - i}-${entry.expr}`}
                  layout
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={SOFT_SPRING}
                >
                  <button
                    type="button"
                    onClick={() => onRecall(entry)}
                    className="group flex w-full items-center justify-between px-3 py-1.5 text-xs transition-colors hover:bg-[var(--glass-hover)]"
                  >
                    <span className="max-w-[60%] truncate tabular-nums text-muted-foreground">{entry.expr}</span>
                    <span className="font-semibold tabular-nums text-foreground/80 transition-colors group-hover:text-primary">
                      = {formatResult(entry.result)}
                    </span>
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
