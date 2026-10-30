import { ArrowDownWideNarrow, CalendarDays, Search, X } from "lucide-react";
import type { PositionFilter } from "../../lib/abrechnung/abrechnungBreakdown";
import { STATUS_META, STATUS_ORDER, type ViewStatus } from "../../lib/abrechnung/abrechnungStatus";
import { cn } from "../../lib/cn";
import { abrechnungTexts as t } from "../../texts/abrechnungTexts";
import { chip, FIELD } from "./abrechnungStyles";

interface PositionFiltersProps {
  filter: PositionFilter;
  counts: Record<ViewStatus, number>;
  total: number;
  familyLabel: string | null;
  onChange: (patch: Partial<PositionFilter>) => void;
}

const CHIP = "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors duration-200";

/** Suche, Status-Chips mit Anzahl, Sortierung und der aktive Produktfilter aus der Aufteilung. */
export default function PositionFilters({ filter, counts, total, familyLabel, onChange }: PositionFiltersProps) {
  const statuses = STATUS_ORDER.filter((s) => counts[s] > 0);
  return (
    <div className="space-y-2.5">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={filter.query}
          onChange={(e) => onChange({ query: e.target.value })}
          placeholder={t.search}
          aria-label={t.search}
          className={cn(FIELD, "pl-9")}
        />
      </div>
      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
        <button type="button" aria-pressed={filter.status === "all"} onClick={() => onChange({ status: "all" })} className={cn(CHIP, chip(filter.status === "all"))}>
          {t.filterAll} <span className="opacity-60">{total}</span>
        </button>
        {statuses.map((s) => (
          <button key={s} type="button" aria-pressed={filter.status === s} onClick={() => onChange({ status: filter.status === s ? "all" : s })} className={cn(CHIP, chip(filter.status === s))}>
            <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_META[s].dot)} />
            {STATUS_META[s].label} <span className="opacity-60">{counts[s]}</span>
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between gap-2">
        {familyLabel ? (
          <button type="button" onClick={() => onChange({ family: null })} className={cn(CHIP, "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300")}>
            {familyLabel} <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={() => onChange({ sort: filter.sort === "date" ? "amount" : "date" })}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-slate-500 transition-colors hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white"
        >
          {filter.sort === "date" ? <CalendarDays className="h-3.5 w-3.5" /> : <ArrowDownWideNarrow className="h-3.5 w-3.5" />}
          {filter.sort === "date" ? t.sortDate : t.sortAmount}
        </button>
      </div>
    </div>
  );
}
