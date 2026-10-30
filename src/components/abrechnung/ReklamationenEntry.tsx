import { ChevronRight, MessageSquareWarning } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../../lib/cn";
import { riseIn } from "../../lib/motion/presets";
import { abrechnungTexts as t } from "../../texts/abrechnungTexts";
import { CARD } from "./abrechnungStyles";

interface ReklamationenEntryProps {
  openCount: number;
  onOpen: () => void;
}

/** Einstieg ins Reklamationen-Center mit Anzahl der offenen Reklamationen (v1). */
export default function ReklamationenEntry({ openCount, onOpen }: ReklamationenEntryProps) {
  return (
    <motion.button
      variants={riseIn}
      type="button"
      onClick={onOpen}
      className={cn(CARD, "flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-transform duration-300 hover:-translate-y-px active:scale-[0.99]")}
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
        <MessageSquareWarning className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-slate-900 dark:text-white">{t.centerTitle}</span>
        <span className="block truncate text-xs text-slate-500 dark:text-neutral-400">{t.centerOpen(openCount)}</span>
      </span>
      {openCount > 0 && <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white tabular-nums">{openCount}</span>}
      <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
    </motion.button>
  );
}
