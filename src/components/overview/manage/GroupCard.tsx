import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState, type ReactNode } from "react";
import { cn } from "../../../lib/cn";
import { riseIn, SOFT_SPRING } from "../../../lib/motion/presets";
import { fill } from "../../../texts/profileTexts";
import { manageTexts } from "../../../texts/manageTexts";
import { GLASS_CARD, GLASS_DIVIDER } from "../../glass/glassStyles";

interface GroupCardProps {
  title: string;
  count: number;
  salesToday: number;
  /** Kopfzeile der Gruppe (meist der Strukturleiter selbst). */
  head?: ReactNode;
  children: ReactNode;
}

const texts = manageTexts.list;

/** Aufklappbare Gruppe eines Strukturleiters; zugeklappt bleibt nur die Kopfzeile mit den Zahlen. */
export default function GroupCard({ title, count, salesToday, head, children }: GroupCardProps) {
  const [open, setOpen] = useState(true);
  return (
    <motion.section variants={riseIn} className={cn(GLASS_CARD)}>
      <button type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-3 px-4 pb-2 pt-3.5 text-left">
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--glass-label)]">{title}</span>
          <span className="mt-0.5 block text-[12.5px] text-muted-foreground">{fill(texts.groupCount, { count, sales: salesToday })}</span>
        </span>
        <ChevronDown aria-hidden className={cn("h-4 w-4 text-slate-400 transition-transform duration-300 dark:text-white/40", open && "rotate-180")} />
      </button>
      {head && <div className={GLASS_DIVIDER}>{head}</div>}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="members" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={SOFT_SPRING} className="overflow-hidden">
            <div className={cn(GLASS_DIVIDER, "border-t border-[var(--glass-divider)]")}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
