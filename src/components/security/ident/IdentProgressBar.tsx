import { motion } from "motion/react";
import { cn } from "@/lib/cn";

interface IdentProgressBarProps {
  steps: readonly { short: string }[];
  step: number;
  label: string;
}

const FILL = { duration: 0.7, ease: [0.16, 1, 0.3, 1] } as const;
const COLS = ["", "grid-cols-1", "grid-cols-2", "grid-cols-3", "grid-cols-4", "grid-cols-5"] as const;

/** Ein Segment je Schritt mit Kurztitel (Handy und Tablet hochkant); ab iPad quer übernimmt die Schrittliste links. */
export default function IdentProgressBar({ steps, step, label }: IdentProgressBarProps) {
  return (
    <div role="progressbar" aria-label={label} aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={Math.min(step, steps.length)} className={cn("grid shrink-0 gap-1.5 px-5 pt-4 lg:hidden", COLS[steps.length])}>
      {steps.map((s, i) => {
        const num = i + 1;
        const done = num < step;
        const active = num === step;
        return (
          <div key={s.short} className="min-w-0">
            <span className="block h-1.5 overflow-hidden rounded-full bg-[var(--glass-track)]">
              <motion.span
                className={cn("block h-full origin-left rounded-full bg-gradient-to-r", done ? "from-emerald-300 to-emerald-500" : "from-rose-400 to-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]")}
                initial={false}
                animate={{ scaleX: done || active ? 1 : 0 }}
                transition={FILL}
              />
            </span>
            <span className={cn("mt-1.5 block truncate text-[10.5px] font-medium transition-colors duration-300", active ? "text-foreground" : done ? "text-emerald-600 dark:text-emerald-400" : "text-[var(--glass-label)]")}>{s.short}</span>
          </div>
        );
      })}
    </div>
  );
}
