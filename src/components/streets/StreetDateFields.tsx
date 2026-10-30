import { AnimatePresence, motion } from "motion/react";
import { cn } from "../../lib/cn";
import type { StreetDateFilter } from "../../lib/streets/streetTypes";
import { streetListTexts } from "../../texts/streetListTexts";
import { GLASS_FIELD } from "../glass/glassStyles";

interface StreetDateFieldsProps {
  filter: StreetDateFilter;
  onChange: (from: string, to: string) => void;
}

const texts = streetListTexts.filter;
const LABEL = "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--glass-label)]";

function DateField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="relative block min-w-0 flex-1">
      <span className={LABEL}>{label}</span>
      <input type="date" value={value} onChange={(e) => e.target.value && onChange(e.target.value)} aria-label={label} className={cn(GLASS_FIELD, label.length > 3 ? "pl-[4.75rem]" : "pl-[3.25rem]", "pr-2 tabular-nums [color-scheme:light] dark:[color-scheme:dark]")} />
    </label>
  );
}

/** Datumsfelder je Modus: ein Tag oder Von/Bis; bei "Gesamt" klappen sie weich weg. */
export default function StreetDateFields({ filter, onChange }: StreetDateFieldsProps) {
  return (
    <AnimatePresence initial={false}>
      {filter.mode !== "all" && (
        <motion.div key="dates" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
          <div className="flex gap-2">
            {filter.mode === "day" ? (
              <DateField label={texts.day} value={filter.from} onChange={(day) => onChange(day, day)} />
            ) : (
              <>
                <DateField label={texts.from} value={filter.from} onChange={(from) => onChange(from, filter.to)} />
                <DateField label={texts.to} value={filter.to} onChange={(to) => onChange(filter.from, to)} />
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
