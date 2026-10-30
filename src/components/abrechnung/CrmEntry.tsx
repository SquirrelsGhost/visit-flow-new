import { Briefcase, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { cn } from "../../lib/cn";
import { riseIn } from "../../lib/motion/presets";
import { abrechnungTexts as t } from "../../texts/abrechnungTexts";
import { CARD } from "./abrechnungStyles";

/** Sprung zu den Aufträgen: dort werden Stornos markiert, die hier als fehlend auftauchen. */
export interface CrmEntryProps { readonly _?: never; }

export default function CrmEntry() {
  return (
    <motion.div variants={riseIn}>
      <Link href="/crm" className={cn(CARD, "flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-transform duration-300 hover:-translate-y-px active:scale-[0.99]")}>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
          <Briefcase className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold text-slate-900 dark:text-white">{t.crmTitle}</span>
          <span className="block truncate text-xs text-slate-500 dark:text-neutral-400">{t.crmText}</span>
        </span>
        <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
      </Link>
    </motion.div>
  );
}
