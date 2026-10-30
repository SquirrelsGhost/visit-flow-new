import { BookOpen } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useKnowledgeSearch } from "../../../hooks/useKnowledgeSearch";
import type { KnowledgeItem } from "../../../lib/assistant/knowledgeTypes";
import { assistantTexts as t } from "../../../texts/assistantTexts";
import SectionCard from "../SectionCard";
import CategoryFilters from "./CategoryFilters";
import KnowledgeCard from "./KnowledgeCard";
import KnowledgeEmpty from "./KnowledgeEmpty";
import KnowledgeSearch from "./KnowledgeSearch";

const title = (
  <span className="bg-gradient-to-r from-purple-700 to-purple-500 bg-clip-text text-transparent dark:from-purple-300 dark:to-purple-400">
    {t.knowledgeTitle}
  </span>
);

/** Wissensdatenbank (v1 KnowledgeSection): Suche, Kategorien mit Zählern, aufklappbare Einträge. */
export interface KnowledgeSectionProps { items: readonly KnowledgeItem[] }

export default function KnowledgeSection({ items }: KnowledgeSectionProps) {
  const s = useKnowledgeSearch(items);
  const count = (
    <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-600 dark:bg-purple-900/40 dark:text-purple-300">
      {t.entries(items.length)}
    </span>
  );

  return (
    <SectionCard icon={BookOpen} title={title} tone="purple" action={count} sparkle>
      <KnowledgeSearch query={s.query} onChange={s.setQuery} total={s.total} />
      <CategoryFilters active={s.filter} onChange={s.setFilter} counts={s.counts} total={s.total} />
      <motion.div layout="position" className="space-y-2.5">
        <AnimatePresence mode="popLayout" initial={false}>
          {s.results.length === 0 ? (
            <KnowledgeEmpty key="empty" />
          ) : (
            s.results.map((item, i) => (
              <KnowledgeCard key={item.id} item={item} index={i} expanded={s.expandedId === item.id} onToggle={() => s.toggle(item.id)} />
            ))
          )}
        </AnimatePresence>
      </motion.div>
      {s.results.length > 0 && s.query.trim() && (
        <p className="mt-4 border-t border-slate-200/60 pt-3 text-center text-xs font-medium text-slate-500 md:text-sm dark:border-slate-700/40 dark:text-slate-400">
          {t.resultsFor(s.results.length, s.query.trim())}
        </p>
      )}
    </SectionCard>
  );
}
