import { Search, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { SNAPPY_SPRING } from "../../../lib/motion/presets";
import { assistantTexts as t } from "../../../texts/assistantTexts";

interface KnowledgeSearchProps {
  query: string;
  onChange: (query: string) => void;
  total: number;
}

/** Suchfeld mit sanftem Leuchten beim Fokus und Trefferzahl rechts (v1 SearchBar), dazu ein Leeren-Knopf. */
export default function KnowledgeSearch({ query, onChange, total }: KnowledgeSearchProps) {
  const active = query.trim().length > 0;
  return (
    <div className="group relative mb-4">
      <div className="pointer-events-none absolute -inset-0.5 rounded-xl bg-gradient-to-r from-purple-200/50 via-blue-200/40 to-purple-200/50 opacity-0 blur-sm transition-opacity duration-300 group-focus-within:opacity-100 dark:from-purple-800/25 dark:via-blue-800/20 dark:to-purple-800/25" />
      <div className="relative">
        <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors duration-300 group-focus-within:text-purple-500" />
        <input
          type="search"
          value={query}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t.searchPlaceholder}
          aria-label={t.searchPlaceholder}
          className="h-11 w-full rounded-xl border-2 border-slate-200/80 bg-white/90 pr-4 pl-10 text-base placeholder:text-sm [&:not(:placeholder-shown)]:pr-20 text-foreground backdrop-blur-sm transition-[border-color,box-shadow] duration-300 placeholder:text-slate-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 focus:outline-none md:h-12 md:text-sm dark:border-slate-700/60 dark:bg-slate-800/70 dark:placeholder:text-slate-500 dark:focus:border-purple-500 dark:focus:ring-purple-900/30 [&::-webkit-search-cancel-button]:hidden"
        />
        <AnimatePresence>
          {active && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={SNAPPY_SPRING}
              className="absolute top-1/2 right-2.5 flex -translate-y-1/2 items-center gap-1"
            >
              <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-600 tabular-nums dark:bg-purple-900/40 dark:text-purple-300">{total}</span>
              <button type="button" onClick={() => onChange("")} aria-label={t.clearSearch} className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700">
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
