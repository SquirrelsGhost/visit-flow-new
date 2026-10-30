import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { riseIn } from "../../lib/motion/presets";
import { isoWeek, shiftAnchor, type ActivityPeriod } from "../../lib/streets/streetActivity";
import { filterLabel } from "../../lib/streets/streetReport";
import type { StreetDateFilter, StreetDateMode } from "../../lib/streets/streetTypes";
import { fill } from "../../texts/profileTexts";
import { streetListTexts } from "../../texts/streetListTexts";
import GlassFilterChips from "../glass/GlassFilterChips";
import GlassSearchField from "../glass/GlassSearchField";
import { GLASS_CARD } from "../glass/glassStyles";
import StreetDateFields from "./StreetDateFields";

interface ActivityFiltersProps {
  period: ActivityPeriod;
  onPeriod: (period: ActivityPeriod) => void;
  anchor: Date;
  onAnchor: (anchor: Date) => void;
  custom: StreetDateFilter;
  onCustom: (filter: StreetDateFilter) => void;
  filter: StreetDateFilter;
  query: string;
  onQuery: (query: string) => void;
}

const texts = streetListTexts.activity;
const PERIODS: readonly ActivityPeriod[] = ["week", "month", "custom"];
const MODES: readonly StreetDateMode[] = ["day", "range", "all"];
const MONTH = new Intl.DateTimeFormat("de-DE", { month: "long", year: "numeric" });
const STEP = "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-foreground transition-colors hover:bg-[var(--glass-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40";

/** Woche, Monat oder individuell (v1); Woche und Monat blättern mit Pfeilen, darunter die Namenssuche. */
export default function ActivityFilters({ period, onPeriod, anchor, onAnchor, custom, onCustom, filter, query, onQuery }: ActivityFiltersProps) {
  const week = isoWeek(anchor);
  const title = period === "week" ? fill(texts.week, week) : MONTH.format(anchor);
  return (
    <motion.div variants={riseIn} className="space-y-3">
      <GlassFilterChips label={texts.periodLabel} layoutId="activity-period" options={PERIODS.map((id) => ({ id, label: texts.periods[id] }))} active={period} onChange={onPeriod} />
      {period !== "custom" ? (
        <div className={`${GLASS_CARD} flex items-center gap-2 px-2 py-2`}>
          <button type="button" aria-label={texts.prev} onClick={() => onAnchor(shiftAnchor(period, anchor, -1))} className={STEP}>
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1 text-center">
            <p className="truncate text-[15px] font-semibold capitalize text-foreground">{title}</p>
            <p className="text-[12px] tabular-nums text-muted-foreground">{filterLabel(filter)}</p>
          </div>
          <button type="button" aria-label={texts.next} onClick={() => onAnchor(shiftAnchor(period, anchor, 1))} className={STEP}>
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <>
          <GlassFilterChips
            label={streetListTexts.filter.label}
            layoutId="activity-mode"
            options={MODES.map((id) => ({ id, label: streetListTexts.filter.modes[id] }))}
            active={custom.mode}
            onChange={(mode) => onCustom(mode === "day" ? { mode, from: custom.from, to: custom.from } : { ...custom, mode })}
          />
          <StreetDateFields filter={custom} onChange={(from, to) => onCustom({ ...custom, from, to: custom.mode === "day" ? from : to < from ? from : to })} />
        </>
      )}
      <GlassSearchField value={query} onChange={onQuery} placeholder={texts.person} />
    </motion.div>
  );
}
