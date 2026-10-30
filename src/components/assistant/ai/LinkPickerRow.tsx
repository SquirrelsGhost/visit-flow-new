import { Check } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { ImportantLink } from "../../../lib/assistant/importantLinks";
import { cn } from "../../../lib/cn";
import { SNAPPY_SPRING } from "../../../lib/motion/presets";

interface LinkPickerRowProps {
  link: ImportantLink;
  selected: boolean;
  onToggle: () => void;
}

/** Eine Zeile der Link-Auswahl mit rundem Haken rechts. */
export default function LinkPickerRow({ link, selected, onToggle }: LinkPickerRowProps) {
  const Icon = link.icon;
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      onClick={onToggle}
      className={cn(
        "flex w-full items-center justify-between rounded-xl border-2 p-3 text-left transition-colors duration-200",
        selected ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600",
      )}
    >
      <span className="flex min-w-0 items-center gap-3">
        <Icon className={cn("h-5 w-5 shrink-0", selected ? "text-blue-500" : "text-slate-400")} />
        <span className="min-w-0">
          <span className={cn("block text-sm font-semibold", selected ? "text-blue-700 dark:text-blue-300" : "text-slate-700 dark:text-slate-300")}>{link.title}</span>
          <span className="line-clamp-1 text-xs text-slate-500">{link.description}</span>
        </span>
      </span>
      <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors", selected ? "border-blue-500 bg-blue-500" : "border-slate-300 dark:border-slate-600")}>
        <AnimatePresence>
          {selected && (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={SNAPPY_SPRING}>
              <Check className="h-3 w-3 text-white" strokeWidth={3} />
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </button>
  );
}
