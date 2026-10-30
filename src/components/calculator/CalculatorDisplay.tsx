// Ergebnis pulsiert bei jeder Änderung sanft (v1 calc-result-pulse)
"use client";

import { Check, Copy } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "../../lib/cn";
import { formatResult, sanitize } from "../../lib/calculator/calcEngine";
import { calculatorTexts as t } from "../../texts/calculatorTexts";

interface CalculatorDisplayProps {
  expr: string;
  result: number | null;
  justCopied: boolean;
  onExprChange: (value: string) => void;
  onCopy: () => void;
}

/** Anzeige aus v1: Rechnung oben (auch direkt tippbar), darunter Kopieren und das große Ergebnis. */
export default function CalculatorDisplay({ expr, result, justCopied, onExprChange, onCopy }: CalculatorDisplayProps) {
  const formatted = formatResult(result);
  return (
    <div className="glass-deep rounded-[22px] p-4 sm:p-5">
      <input
        value={expr}
        onChange={(e) => onExprChange(sanitize(e.target.value))}
        placeholder={t.placeholder}
        aria-label={t.expressionLabel}
        inputMode="decimal"
        className="w-full bg-transparent p-0 text-xl font-medium tabular-nums text-white/80 outline-none placeholder:text-white/30 sm:text-2xl"
      />
      <div className="relative mt-2 flex items-center justify-between gap-3 border-t border-white/10 pt-2 sm:mt-3 sm:pt-3">
        <button
          type="button"
          onClick={onCopy}
          aria-label={justCopied ? t.copied : t.copy}
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-300 sm:h-9 sm:w-9",
            justCopied ? "bg-emerald-400/20 text-emerald-200" : "text-white/70 hover:bg-white/10",
          )}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={justCopied ? "ok" : "copy"}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              {justCopied ? <Check className="h-4 w-4 sm:h-5 sm:w-5" /> : <Copy className="h-4 w-4 sm:h-5 sm:w-5" />}
            </motion.span>
          </AnimatePresence>
        </button>
        <motion.output
          key={formatted}
          aria-live="polite"
          initial={{ scale: 0.97, opacity: 0.55 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="glass-text-shine min-w-0 origin-right truncate text-[34px] font-semibold tracking-[-0.03em] tabular-nums sm:text-[40px]"
        >
          {formatted}
        </motion.output>
      </div>
    </div>
  );
}
