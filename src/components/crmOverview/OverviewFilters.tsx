import { AlertTriangle, ArrowUpDown, User } from "lucide-react";
import { motion } from "motion/react";
import { rangeFor } from "../../lib/crmOverview/overviewLogic";
import { ALL_USERS, type OverviewFilter, type SalesPerson, type SortId } from "../../lib/crmOverview/overviewTypes";
import { riseIn } from "../../lib/motion/presets";
import { crmOverviewTexts as t } from "../../texts/crmOverviewTexts";
import GlassIcon from "../glass/GlassIcon";
import GlassRowText from "../glass/GlassRowText";
import GlassSearchField from "../glass/GlassSearchField";
import StreetFilterChip from "../streets/StreetFilterChip";
import GlassSection from "../glass/GlassSection";
import GlassSwitch from "../glass/GlassSwitch";
import { GLASS_ROW, GLASS_ROW_INTERACTIVE } from "../glass/glassStyles";
import OverviewRange from "./OverviewRange";
import OverviewSelectRow from "./OverviewSelectRow";

interface OverviewFiltersProps {
  filter: OverviewFilter;
  people: readonly SalesPerson[];
  onChange: (patch: Partial<OverviewFilter>) => void;
  /** Nimmt die Straße auch aus der Adresse. */
  onClearStreet: () => void;
}

const SORTS: readonly SortId[] = ["date", "commission", "name"];

/** Zeitraum und Suche über den Karten, darunter Verkäufer, Sortierung und "Nur Probleme" als Glas-Zeilen (v1 Filterleiste). */
export default function OverviewFilters({ filter, people, onChange, onClearStreet }: OverviewFiltersProps) {
  const sellers = [{ value: ALL_USERS, label: t.allSellers }, ...people.map((p) => ({ value: p.id, label: `${p.name} (${p.count})` }))];
  return (
    <>
      <motion.div variants={riseIn} className="space-y-3">
        <StreetFilterChip
          street={filter.street ?? null}
          onClear={() => {
            onChange({ street: null });
            onClearStreet();
          }}
        />
        <OverviewRange
          range={filter.range}
          onRange={(id) => onChange({ range: rangeFor(id, new Date(), filter.range) })}
          onDates={(from, to) => onChange({ range: { id: "custom", from, to } })}
        />
        <GlassSearchField value={filter.query} onChange={(query) => onChange({ query })} placeholder={t.search} />
      </motion.div>
      <GlassSection label={t.filters}>
        <OverviewSelectRow icon={User} tone="blue" title={t.seller} value={filter.userId} options={sellers} onChange={(userId) => onChange({ userId })} />
        <OverviewSelectRow icon={ArrowUpDown} tone="purple" title={t.sort} value={filter.sort} options={SORTS.map((id) => ({ value: id, label: t.sorts[id] }))} onChange={(sort) => onChange({ sort: sort as SortId })} />
        <button type="button" role="switch" aria-checked={filter.onlyIssues} onClick={() => onChange({ onlyIssues: !filter.onlyIssues })} className={`${GLASS_ROW} ${GLASS_ROW_INTERACTIVE}`}>
          <GlassIcon icon={AlertTriangle} tone="red" />
          <GlassRowText title={t.onlyIssues} subtitle={t.onlyIssuesHint} />
          <GlassSwitch checked={filter.onlyIssues} />
        </button>
      </GlassSection>
    </>
  );
}
