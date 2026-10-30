import { Check, Info, Trash2, X } from "lucide-react";
import { motion } from "motion/react";
import { riseIn } from "../../lib/motion/presets";
import { crmTexts as t } from "../../texts/crmTexts";
import { GLASS_CARD } from "../glass/glassStyles";

/** Erklärung der Gesten (Telco/Energie) bzw. dass Leads über Pipedrive laufen (v1 Fußzeile). */
export interface CrmHintsProps { lead: boolean }

export default function CrmHints({ lead }: CrmHintsProps) {
  if (lead) {
    return (
      <motion.p variants={riseIn} className={`${GLASS_CARD} flex gap-3 px-4 py-3.5 text-[13px] leading-snug text-muted-foreground`}>
        <Info aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-purple-500" />
        {t.leadsInfo}
      </motion.p>
    );
  }
  return (
    <motion.ul variants={riseIn} className={`${GLASS_CARD} space-y-2.5 px-4 py-3.5 text-[13px] text-muted-foreground`}>
      <li className="flex items-center gap-2.5">
        <span className="glass-keep-white grid h-6 w-6 shrink-0 place-items-center rounded-full bg-red-500 text-white">
          <X aria-hidden className="h-3.5 w-3.5" strokeWidth={2.8} />
        </span>
        {t.swipeCancel}
      </li>
      <li className="flex items-center gap-2.5">
        <span className="glass-keep-white grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-500 text-white">
          <Check aria-hidden className="h-3.5 w-3.5" strokeWidth={2.8} />
        </span>
        {t.swipeComplete}
      </li>
      <li className="flex items-center gap-2.5">
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-slate-900/[0.06] text-slate-500 dark:bg-white/10 dark:text-white/60">
          <Trash2 aria-hidden className="h-3.5 w-3.5" />
        </span>
        {t.swipeDiscard}
      </li>
    </motion.ul>
  );
}
