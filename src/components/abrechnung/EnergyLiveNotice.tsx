import { Zap } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../../lib/cn";
import { riseIn } from "../../lib/motion/presets";
import { abrechnungTexts as t } from "../../texts/abrechnungTexts";
import { CARD, CARD_TITLE } from "./abrechnungStyles";

/** Strom/Gas ohne Demo: der Server kennt noch keine Energie-Abrechnung (v1 zeigt hier denselben Hinweis). */
export interface EnergyLiveNoticeProps { readonly _?: never; }

export default function EnergyLiveNotice() {
  return (
    <motion.section variants={riseIn} className={cn(CARD, "flex gap-4 p-5")}>
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
        <Zap className="h-5 w-5" />
      </span>
      <div>
        <h2 className={CARD_TITLE}>{t.energyLiveTitle}</h2>
        <p className="mt-1 text-sm text-pretty text-slate-500 dark:text-neutral-400">{t.energyLiveBody}</p>
      </div>
    </motion.section>
  );
}
