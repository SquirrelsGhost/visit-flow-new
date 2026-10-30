import { AnimatePresence, motion } from "motion/react";
import { cn } from "../../lib/cn";
import type { DateRange, RangeId } from "../../lib/crmOverview/overviewTypes";
import { crmOverviewTexts as t } from "../../texts/crmOverviewTexts";
import GlassFilterChips from "../glass/GlassFilterChips";
import { GLASS_FIELD } from "../glass/glassStyles";

interface OverviewRangeProps {
  range: DateRange;
  onRange: (id: RangeId) => void;
  onDates: (from: string, to: string) => void;
}

const RANGES: readonly RangeId[] = ["today", "week", "month", "all", "custom"];
const LABEL = "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--glass-label)]";

function DateField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="relative block min-w-0 flex-1">
      <span className={LABEL}>{label}</span>
      <input type="date" value={value} onChange={(e) => e.target.value && onChange(e.target.value)} aria-label={label} className={cn(GLASS_FIELD, "pl-[3.25rem] pr-2 tabular-nums [color-scheme:light] dark:[color-scheme:dark]")} />
    </label>
  );
}

/** Schnellfilter wie v1 (Heute, Diese Woche, Dieser Monat), dazu Gesamt; "Zeitraum" klappt Von/Bis weich auf. */
export default function OverviewRange({ range, onRange, onDates }: OverviewRangeProps) {
  return (
    <>
      <GlassFilterChips label={t.rangeLabel} layoutId="crm-overview-range" options={RANGES.map((id) => ({ id, label: t.ranges[id] }))} active={range.id} onChange={onRange} />
      <AnimatePresence initial={false}>
        {range.id === "custom" && (
          <motion.div key="dates" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="flex gap-2">
              <DateField label={t.from} value={range.from} onChange={(from) => onDates(from, range.to < from ? from : range.to)} />
              <DateField label={t.to} value={range.to} onChange={(to) => onDates(range.from > to ? to : range.from, to)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
