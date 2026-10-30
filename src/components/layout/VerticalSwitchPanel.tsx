import { Check } from "lucide-react";
import { motion } from "motion/react";
import type { Vertical } from "../../lib/battle/battleCategories";
import { cn } from "../../lib/cn";
import { riseIn, SNAPPY_SPRING, staggerParent } from "../../lib/motion/presets";
import type { VerticalOption } from "../../lib/navigation/verticals";
import { shellTexts } from "../../texts/appTexts";

interface VerticalSwitchPanelProps {
  options: readonly VerticalOption[];
  active: Vertical;
  onSelect: (vertical: Vertical) => void;
}

const PANEL =
  "absolute right-0 top-full z-50 mt-3 w-56 origin-top-right overflow-hidden glass-surface glass-blur rounded-[22px] p-1.5";
const ROW =
  "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-xs font-medium transition-colors duration-200 focus:outline-none";

/** Auswahl der Sparten unter dem Umschalter; die gewählte Sparte ist farbig hinterlegt und abgehakt. */
export default function VerticalSwitchPanel({ options, active, onSelect }: VerticalSwitchPanelProps) {
  return (
    <motion.div
      role="menu"
      aria-label={shellTexts.verticalSwitch}
      className={PANEL}
      initial={{ opacity: 0, scale: 0.92, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -6, transition: { duration: 0.15 } }}
      transition={SNAPPY_SPRING}
    >
      <p className="px-2.5 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
        {shellTexts.verticalSwitch}
      </p>
      <motion.ul role="none" className="space-y-0.5" initial="hidden" animate="show" variants={staggerParent(0.04, 0.04)}>
        {options.map((option) => {
          const selected = option.id === active;
          const Icon = option.icon;
          return (
            <motion.li key={option.id} role="none" variants={riseIn}>
              <button
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                onClick={() => onSelect(option.id)}
                className={cn(
                  ROW,
                  selected ? option.activeTone : "text-slate-700 hover:bg-slate-50 focus-visible:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800",
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", option.iconTone)} />
                <span className="flex-1">{option.menuLabel}</span>
                {selected && <Check className="h-3.5 w-3.5 shrink-0" />}
              </button>
            </motion.li>
          );
        })}
      </motion.ul>
    </motion.div>
  );
}
