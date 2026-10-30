import { ChevronDown, Hash } from "lucide-react";
import { motion } from "motion/react";
import { IVR_MENU, QUICK_PATHS } from "../../../lib/assistant/hotline";
import { cn } from "../../../lib/cn";
import { SNAPPY_SPRING } from "../../../lib/motion/presets";
import { assistantTexts as t } from "../../../texts/assistantTexts";
import Collapse from "../Collapse";
import IvrNodeRow from "./IvrNodeRow";

interface IvrGuideProps {
  open: boolean;
  onToggle: () => void;
}

const LABEL = "mb-2 text-[10px] font-semibold text-slate-600 md:text-xs dark:text-slate-400";

/** Aufklappbarer "Tastatur-Menü Wegweiser": Schnellwahl und vollständiger Menübaum der Hotline. */
export default function IvrGuide({ open, onToggle }: IvrGuideProps) {
  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-green-200 bg-green-50/50 px-4 py-2.5 transition-colors duration-200 hover:bg-green-50 dark:border-green-800 dark:bg-green-950/20 dark:hover:bg-green-950/30"
      >
        <span className="flex items-center gap-2">
          <Hash className="h-4 w-4 text-green-600 md:h-5 md:w-5 dark:text-green-400" />
          <span className="text-xs font-semibold text-green-700 md:text-sm dark:text-green-300">{t.menuGuide}</span>
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={SNAPPY_SPRING}>
          <ChevronDown className="h-4 w-4 text-green-600 dark:text-green-400" />
        </motion.span>
      </button>
      <Collapse open={open} className="pt-2">
        <div className="mb-2 rounded-xl border border-slate-200/60 bg-slate-50 p-3 dark:border-slate-700/40 dark:bg-slate-800/30">
          <p className={LABEL}>{t.quickDial}</p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_PATHS.map((qp) => (
              <span key={qp.label} className={cn("inline-flex items-center gap-1.5 rounded-lg border border-current/10 px-2.5 py-1.5 text-[10px] md:text-[11px]", qp.color)}>
                <span className="font-semibold">{qp.label}:</span>
                <span className="font-mono font-bold">{qp.path}</span>
              </span>
            ))}
          </div>
        </div>
        <div className="glass-surface rounded-[18px] p-3">
          <p className={LABEL}>{t.fullMenu}</p>
          <div className="space-y-0.5">
            {IVR_MENU.map((node) => (
              <IvrNodeRow key={node.key} node={node} />
            ))}
          </div>
        </div>
      </Collapse>
    </div>
  );
}
