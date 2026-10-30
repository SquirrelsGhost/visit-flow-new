import { ArrowUpDown, MapPin, Package, RotateCcw, UserCheck } from "lucide-react";
import { motion } from "motion/react";
import { EMPTY_FILTER } from "../../hooks/useExpiringContracts";
import { ALL, type AssignFilter, type CountedOption, type ExpiringFilter, type SortId } from "../../lib/expiring/expiringTypes";
import { riseIn } from "../../lib/motion/presets";
import { expiringTexts as t } from "../../texts/expiringTexts";
import OverviewSelectRow from "../crmOverview/OverviewSelectRow";
import GlassRow from "../glass/GlassRow";
import GlassSearchField from "../glass/GlassSearchField";
import GlassSection from "../glass/GlassSection";

interface ExpiringFiltersProps {
  filter: ExpiringFilter;
  categories: readonly CountedOption[];
  cities: readonly CountedOption[];
  onChange: (patch: Partial<ExpiringFilter>) => void;
  onReset: () => void;
}

const ASSIGNS: readonly AssignFilter[] = ["all", "assigned", "unassigned"];
const SORTS: readonly SortId[] = ["days", "commission", "name"];

/** Weicht der Filter (ohne Sortierung) vom Start ab? */
export const isFiltered = (f: ExpiringFilter) =>
  f.urgency !== EMPTY_FILTER.urgency || f.category !== ALL || f.city !== ALL || f.assign !== "all" || f.query.trim() !== "";

/** Suche über den Karten, darunter Kategorie, Ort, Zuweisung und Sortierung als Glas-Zeilen (v1 Filterraster). */
export default function ExpiringFilters({ filter, categories, cities, onChange, onReset }: ExpiringFiltersProps) {
  const categoryOptions = [{ value: ALL, label: t.allCategories }, ...categories.map((c) => ({ value: c.value, label: `${t.categoryLabel(c.value)} (${c.count})` }))];
  const cityOptions = [{ value: ALL, label: t.allCities }, ...cities.map((c) => ({ value: c.value, label: `${c.value} (${c.count})` }))];
  return (
    <>
      <motion.div variants={riseIn}>
        <GlassSearchField value={filter.query} onChange={(query) => onChange({ query })} placeholder={t.search} />
      </motion.div>
      <GlassSection label={t.filters}>
        <OverviewSelectRow icon={Package} tone="purple" title={t.category} value={filter.category} options={categoryOptions} onChange={(category) => onChange({ category })} />
        <OverviewSelectRow icon={MapPin} tone="orange" title={t.city} value={filter.city} options={cityOptions} onChange={(city) => onChange({ city })} />
        <OverviewSelectRow icon={UserCheck} tone="green" title={t.assign} value={filter.assign} options={ASSIGNS.map((id) => ({ value: id, label: t.assigns[id] }))} onChange={(assign) => onChange({ assign: assign as AssignFilter })} />
        <OverviewSelectRow icon={ArrowUpDown} tone="blue" title={t.sort} value={filter.sort} options={SORTS.map((id) => ({ value: id, label: t.sorts[id] }))} onChange={(sort) => onChange({ sort: sort as SortId })} />
        {isFiltered(filter) && <GlassRow icon={RotateCcw} tone="gray" title={t.reset} onClick={onReset} chevron={false} />}
      </GlassSection>
    </>
  );
}
