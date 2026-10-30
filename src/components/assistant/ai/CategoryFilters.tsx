import { motion } from "motion/react";
import { KNOWLEDGE_CATEGORIES } from "../../../lib/assistant/knowledgeBase";
import { ALL_ACTIVE, CATEGORY_ACCENTS, CATEGORY_ICONS } from "../../../lib/assistant/knowledgeStyles";
import type { CategoryFilter, KnowledgeCategory } from "../../../lib/assistant/knowledgeTypes";
import { cn } from "../../../lib/cn";
import { assistantTexts as t } from "../../../texts/assistantTexts";

const FILTERS: readonly CategoryFilter[] = ["all", ...KNOWLEDGE_CATEGORIES];
const IDLE = "bg-white/80 text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700/50";

interface CategoryFiltersProps {
  active: CategoryFilter;
  onChange: (filter: CategoryFilter) => void;
  counts: Record<KnowledgeCategory, number>;
  total: number;
}

/** Kategorie-Chips mit Zähler; aktiv in der Kategoriefarbe. Auf dem Handy kurze Namen wie in v1. */
export default function CategoryFilters({ active, onChange, counts, total }: CategoryFiltersProps) {
  return (
    <div className="mb-4 flex flex-wrap gap-1.5 md:gap-2.5" role="group" aria-label={t.knowledgeTitle}>
      {FILTERS.map((filter) => {
        const Icon = CATEGORY_ICONS[filter];
        const selected = filter === active;
        const count = filter === "all" ? total : counts[filter];
        return (
          <motion.button
            key={filter}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(filter)}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium whitespace-nowrap transition-[background-color,color,border-color,box-shadow] duration-300 md:px-3.5 md:py-2 md:text-[13px]",
              selected ? (filter === "all" ? ALL_ACTIVE : CATEGORY_ACCENTS[filter].active) : IDLE,
            )}
          >
            <Icon className="h-3 w-3 shrink-0 md:h-3.5 md:w-3.5" />
            <span className="md:hidden">{t.categoryShort[filter]}</span>
            <span className="hidden md:inline">{t.categoryLong[filter]}</span>
            <span
              className={cn(
                "inline-flex h-3.5 min-w-[14px] items-center justify-center rounded-full px-0.5 text-[9px] font-semibold tabular-nums md:h-[18px] md:min-w-[18px] md:px-1 md:text-[11px]",
                selected ? "bg-white/25 text-current" : "bg-slate-200/80 text-slate-500 dark:bg-slate-700/60 dark:text-slate-400",
              )}
            >
              {count}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
