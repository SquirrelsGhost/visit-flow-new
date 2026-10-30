import { BarChart3 } from "lucide-react";
import { motion } from "motion/react";
import { ME_CARD } from "../../../lib/assistant/meStyles";
import { cn } from "../../../lib/cn";
import { SOFT_SPRING } from "../../../lib/motion/presets";
import { meTexts as t } from "../../../texts/assistantTexts";

/** Lade- oder Leerzustand des Reiters "Ich". */
export interface MeStateProps { loading?: boolean }

export default function MeState({ loading = false }: MeStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={SOFT_SPRING}
      className={cn("p-10 text-center", ME_CARD)}
      role="status"
      aria-busy={loading}
    >
      {loading ? (
        <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-[3px] border-slate-200 border-t-red-500 motion-reduce:animate-none dark:border-slate-700 dark:border-t-red-500" />
      ) : (
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          <BarChart3 className="h-6 w-6" />
        </span>
      )}
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{loading ? t.loading : t.noData}</p>
    </motion.div>
  );
}
