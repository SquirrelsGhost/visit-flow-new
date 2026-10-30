import { ChevronDown } from "lucide-react";
import { motion } from "motion/react";
import { forwardRef } from "react";
import { splitSteps } from "../../../lib/assistant/knowledgeBase";
import { CATEGORY_ACCENTS, CATEGORY_ICONS } from "../../../lib/assistant/knowledgeStyles";
import type { KnowledgeItem } from "../../../lib/assistant/knowledgeTypes";
import { cn } from "../../../lib/cn";
import { SOFT_SPRING } from "../../../lib/motion/presets";
import { assistantTexts as t } from "../../../texts/assistantTexts";
import Collapse from "../Collapse";

interface KnowledgeCardProps {
  item: KnowledgeItem;
  index: number;
  expanded: boolean;
  onToggle: () => void;
}

/** Ein Eintrag der Wissensdatenbank: Farbstreifen der Kategorie, Vorschau und aufklappbare Vorgehensweise (v1 KnowledgeCard). */
const KnowledgeCard = forwardRef<HTMLDivElement, KnowledgeCardProps>(function KnowledgeCard({ item, index, expanded, onToggle }, ref) {
  const accent = CATEGORY_ACCENTS[item.category];
  const Icon = CATEGORY_ICONS[item.category];
  const { intro, steps } = splitSteps(item.content);
  const panelId = `knowledge-${item.id}`;

  return (
    <motion.div
      ref={ref}
      layout="position"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.15 } }}
      transition={{ ...SOFT_SPRING, delay: Math.min(index, 8) * 0.03 }}
      className={cn(
        "glass-surface relative overflow-hidden rounded-[18px] transition-[border-color,box-shadow] duration-300",
        accent.hoverBorder,
        expanded && cn("shadow-lg", accent.glow),
      )}
    >
      <span aria-hidden className={cn("absolute inset-y-0 left-0 w-1", accent.stripe)} />
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={panelId}
        className="flex w-full items-start gap-3 py-3 pr-3 pl-4 text-left md:py-4 md:pr-4 md:pl-5"
      >
        <span className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", accent.light)}>
          <Icon className={cn("h-4 w-4", accent.icon)} />
        </span>
        <span className="min-w-0 flex-1">
          <span className={cn("mb-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold md:text-xs", accent.badge)}>
            {t.categoryShort[item.category]}
          </span>
          <span className="block text-sm leading-snug font-semibold text-foreground md:text-base">{item.title}</span>
          {!expanded && <span className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{intro ?? steps}</span>}
        </span>
        <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={SOFT_SPRING} className="mt-1 shrink-0 text-slate-400">
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </button>
      <Collapse open={expanded} className="space-y-3 pr-3 pb-4 pl-4 md:pr-4 md:pl-5">
        <div id={panelId}>
          {intro && <p className="text-sm leading-relaxed whitespace-pre-line text-slate-700 dark:text-slate-300">{intro}</p>}
          {steps && (
            <div className="mt-3 rounded-xl border border-green-200 bg-green-50/80 p-3 dark:border-green-900/50 dark:bg-green-950/30">
              <p className="mb-1.5 text-xs font-bold tracking-wide text-green-700 dark:text-green-400">✅ {t.stepsTitle}</p>
              <p className="text-sm leading-relaxed whitespace-pre-line text-green-900 dark:text-green-100">{steps}</p>
            </div>
          )}
          {item.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {item.tags.map((tag) => (
                <span key={tag} className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Collapse>
    </motion.div>
  );
});

export default KnowledgeCard;
