import { Search } from "lucide-react";
import { motion } from "motion/react";
import { forwardRef } from "react";
import { assistantTexts as t } from "../../../texts/assistantTexts";

/** Hinweis, wenn die Suche nichts findet. Ref für das Ein- und Ausblenden in der Liste. */
export interface KnowledgeEmptyProps { readonly _?: never; }

const KnowledgeEmpty = forwardRef<HTMLDivElement, KnowledgeEmptyProps>(function KnowledgeEmpty(_, ref) {
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="py-10 text-center">
      <div className="mb-3 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800/50">
        <Search className="h-8 w-8 text-slate-300 dark:text-slate-600" />
      </div>
      <p className="text-sm font-medium text-slate-500 md:text-base dark:text-slate-400">{t.noResults}</p>
      <p className="mt-1 text-xs text-slate-400 md:text-sm dark:text-slate-500">{t.tryOther}</p>
    </motion.div>
  );
});

export default KnowledgeEmpty;
