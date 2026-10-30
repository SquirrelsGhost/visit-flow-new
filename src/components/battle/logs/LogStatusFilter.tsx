// Gleitende Markierung unter dem gewählten Filter
"use client";

import { motion } from "motion/react";
import { useId } from "react";
import { LOG_STATUSES, type LogFilter } from "../../../lib/battle/battleLogs";
import { cn } from "../../../lib/cn";
import { SNAPPY_SPRING } from "../../../lib/motion/presets";
import { battleLogTexts as t } from "../../../texts/battleAdminTexts";

interface LogStatusFilterProps {
  value: LogFilter;
  total: number;
  counts: Partial<Record<LogFilter, number>>;
  onChange: (value: LogFilter) => void;
}

const label = (f: LogFilter) => (f === "all" ? t.filterAll : String((t as Record<string, unknown>)[`status_${f}`] ?? f));

/** Filter-Chips nach Status mit Anzahl; nur Status, die es an dem Tag gibt. Waagerecht wischbar auf dem Handy. */
export default function LogStatusFilter({ value, total, counts, onChange }: LogStatusFilterProps) {
  const pillId = useId();
  const filters: LogFilter[] = ["all", ...LOG_STATUSES.filter((s) => counts[s])];
  if (filters.length <= 2) return null;
  return (
    <div role="radiogroup" aria-label={t.filterLabel} className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none]">
      {filters.map((f) => {
        const selected = f === value;
        return (
          <button
            key={f}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(f)}
            className={cn(
              "relative flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[12px] font-medium transition-colors duration-300",
              selected ? "text-white" : "text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-neutral-400 dark:hover:bg-white/5 dark:hover:text-neutral-100",
            )}
          >
            {selected && (
              <motion.span layoutId={pillId} transition={SNAPPY_SPRING} className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500 to-red-600 shadow-[0_6px_16px_-6px_rgba(220,38,38,0.7)]" />
            )}
            <span className="relative">{label(f)}</span>
            <span className={cn("relative tabular-nums", selected ? "text-white/75" : "text-slate-400 dark:text-neutral-500")}>{f === "all" ? total : counts[f]}</span>
          </button>
        );
      })}
    </div>
  );
}
