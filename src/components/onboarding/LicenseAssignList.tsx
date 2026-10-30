import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { SOFT_SPRING } from "../../lib/motion/presets";
import { onboardingTexts as T } from "../../texts/onboardingTexts";
import LicenseRow from "./LicenseRow";

interface LicenseAssignListProps {
  slots: string[];
  assigned: number;
  onSlot: (index: number, value: string) => void;
}

/** Optional: jede Lizenz gleich einem Berater zuweisen. Neue Plätze gleiten herein, entfernte klappen weg. */
export default function LicenseAssignList({ slots, assigned, onSlot }: LicenseAssignListProps) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          aria-expanded={open}
          aria-controls="license-slots"
          onClick={() => setOpen((current) => !current)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 transition-colors hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
        >
          {open && <ChevronDown className="h-3.5 w-3.5" strokeWidth={2.25} />}
          {open ? T.assignHide : T.assignShow}
        </button>
        {assigned > 0 && (
          <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
            {T.assignedOf(assigned, slots.length)}
          </span>
        )}
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id="license-slots"
            key="slots"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={SOFT_SPRING}
            className="overflow-hidden"
          >
            <p className="mt-2 text-[11px] text-muted-foreground">{T.assignHint}</p>
            <ul className="mt-2 max-h-72 overflow-y-auto overscroll-contain pr-1">
              <AnimatePresence initial={false}>
                {slots.map((slot, index) => (
                  <LicenseRow key={index} index={index + 1} value={slot} onChange={(value) => onSlot(index, value)} />
                ))}
              </AnimatePresence>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
