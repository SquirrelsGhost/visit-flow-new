import { SearchX } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { filterRows, seatCounts } from "../../lib/licenses/licenseLogic";
import type { SeatFilter, SeatRow } from "../../lib/licenses/licenseTypes";
import { riseIn } from "../../lib/motion/presets";
import { licenseTexts } from "../../texts/licenseTexts";
import GlassFilterChips from "../glass/GlassFilterChips";
import GlassSearchField from "../glass/GlassSearchField";
import { GLASS_CARD, GLASS_DIVIDER, GLASS_FOOTER, GLASS_LABEL } from "../glass/glassStyles";
import { cn } from "../../lib/cn";
import SeatListRow from "./SeatListRow";

interface MemberSectionProps {
  rows: readonly SeatRow[];
  onOpen: (row: SeatRow) => void;
}

const texts = licenseTexts.members;
const FILTERS: readonly SeatFilter[] = ["all", "active", "pending", "inactive", "free"];

/** Alle Plätze des Teams: Suche, Filter mit Anzahl und die Liste der Personen und freien Lizenzen. */
export default function MemberSection({ rows, onOpen }: MemberSectionProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<SeatFilter>("all");
  const counts = useMemo(() => seatCounts(rows), [rows]);
  const visible = useMemo(() => filterRows(rows, filter, query), [rows, filter, query]);
  const options = FILTERS.filter((id) => id === "all" || counts[id] > 0).map((id) => ({ id, label: texts.filters[id], count: counts[id] }));

  return (
    <motion.section variants={riseIn} className="space-y-3">
      <h3 className={cn(GLASS_LABEL, "pb-0")}>{texts.label}</h3>
      <GlassSearchField value={query} onChange={setQuery} placeholder={texts.search} />
      <GlassFilterChips options={options} active={filter} onChange={setFilter} label={texts.label} layoutId="license-member-filter" />
      <div className={cn(GLASS_CARD, GLASS_DIVIDER)}>
        {visible.length === 0 ? (
          <div className="flex flex-col items-center gap-1 px-4 py-8 text-center">
            <SearchX aria-hidden className="mb-1 h-6 w-6 text-slate-400 dark:text-white/30" />
            <p className="text-[15px] font-semibold text-foreground">{texts.empty}</p>
            <p className="text-[13px] text-muted-foreground">{texts.emptyText}</p>
          </div>
        ) : (
          visible.map((row) => <SeatListRow key={row.kind === "free" ? `free-${row.slot}` : row.email} row={row} onOpen={onOpen} />)
        )}
      </div>
      <p className={GLASS_FOOTER}>{texts.footer}</p>
    </motion.section>
  );
}
