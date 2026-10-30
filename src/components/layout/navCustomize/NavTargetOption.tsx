import { Check } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import GlassIcon from "../../glass/GlassIcon";
import GlassRowText from "../../glass/GlassRowText";
import { GLASS_ROW, GLASS_ROW_INTERACTIVE } from "../../glass/glassStyles";
import { cn } from "../../../lib/cn";
import { SNAPPY_SPRING } from "../../../lib/motion/presets";
import type { NavTarget } from "../../../lib/navigation/navTargets";

interface NavTargetOptionProps {
  target: NavTarget;
  label: string;
  subtitle: string;
  current: boolean;
  onChoose: () => void;
}

/** Eine wählbare Seite im Sheet; die aktuelle Belegung trägt ein Häkchen. */
export default function NavTargetOption({ target, label, subtitle, current, onChoose }: NavTargetOptionProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={current}
      onClick={onChoose}
      className={cn(GLASS_ROW, GLASS_ROW_INTERACTIVE, current && "bg-red-500/[0.06] dark:bg-red-400/[0.07]")}
    >
      <GlassIcon icon={target.icon} tone={target.tone} />
      <GlassRowText title={label} subtitle={subtitle} />
      <AnimatePresence initial={false}>
        {current && (
          <motion.span
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={SNAPPY_SPRING}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-red-500 to-red-600 text-white shadow-[0_4px_12px_-4px_rgba(220,38,38,0.7)]"
          >
            <Check aria-hidden className="h-3.5 w-3.5" strokeWidth={3} />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
