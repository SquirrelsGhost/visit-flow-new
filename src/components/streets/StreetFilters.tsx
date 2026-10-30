import { motion } from "motion/react";
import type { useStreetList } from "../../hooks/useStreetList";
import { ALL_GROUPS } from "../../hooks/useStreetList";
import { riseIn } from "../../lib/motion/presets";
import type { StreetDateMode } from "../../lib/streets/streetTypes";
import { streetListTexts } from "../../texts/streetListTexts";
import GlassFilterChips from "../glass/GlassFilterChips";
import GlassSearchField from "../glass/GlassSearchField";
import StreetDateFields from "./StreetDateFields";

interface StreetFiltersProps {
  list: ReturnType<typeof useStreetList>;
  groups: readonly string[];
}

const texts = streetListTexts.filter;
const MODES: readonly StreetDateMode[] = ["day", "range", "all"];

/** Zeitraum (Tag, Zeitraum, Gesamt wie v1), Datum, Suche und beim Strukturleiter die eigenen Gruppen. */
export default function StreetFilters({ list, groups }: StreetFiltersProps) {
  return (
    <motion.div variants={riseIn} className="space-y-3">
      <GlassFilterChips label={texts.label} layoutId="street-mode" options={MODES.map((id) => ({ id, label: texts.modes[id] }))} active={list.filter.mode} onChange={list.setMode} />
      <StreetDateFields filter={list.filter} onChange={list.setDates} />
      <GlassSearchField value={list.query} onChange={list.setQuery} placeholder={texts.search} />
      {groups.length > 0 && (
        <GlassFilterChips
          label={texts.groups}
          layoutId="street-group"
          options={[{ id: ALL_GROUPS, label: texts.allGroups }, ...groups.map((g) => ({ id: g, label: g }))]}
          active={list.group}
          onChange={list.setGroup}
        />
      )}
    </motion.div>
  );
}
