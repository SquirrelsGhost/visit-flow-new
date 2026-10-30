import { motion } from "motion/react";
import type { AbrechnungCategory } from "../../lib/abrechnung/abrechnungTypes";
import { riseIn } from "../../lib/motion/presets";
import { abrechnungTexts as t } from "../../texts/abrechnungTexts";

interface AbrechnungHeaderProps {
  category: AbrechnungCategory;
  demo: boolean;
}

/** Schmale Kopfzeile: aktiver Bereich und Demo-Hinweis. Der Seitentitel steht in der Topbar. */
export default function AbrechnungHeader({ category, demo }: AbrechnungHeaderProps) {
  return (
    <motion.div variants={riseIn} className="flex items-center gap-2 px-1 text-xs font-medium text-slate-500 dark:text-neutral-400">
      <span className="truncate">{t.categoryLabel[category]}</span>
      {demo && (
        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-emerald-700 uppercase ring-1 ring-emerald-500/20 dark:text-emerald-300">
          {t.demoBadge}
        </span>
      )}
    </motion.div>
  );
}
