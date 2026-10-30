import { User } from "lucide-react";
import { motion } from "motion/react";
import type { BackofficeFilter, SellerSummary } from "../../lib/backoffice/backofficeTypes";
import { rangeFor } from "../../lib/crmOverview/overviewLogic";
import { ALL_USERS } from "../../lib/crmOverview/overviewTypes";
import { riseIn } from "../../lib/motion/presets";
import { backofficeTexts as t } from "../../texts/backofficeTexts";
import OverviewRange from "../crmOverview/OverviewRange";
import OverviewSelectRow from "../crmOverview/OverviewSelectRow";
import GlassSearchField from "../glass/GlassSearchField";
import GlassSection from "../glass/GlassSection";
import StreetFilterChip from "../streets/StreetFilterChip";

interface BackofficeFiltersProps {
  filter: BackofficeFilter;
  sellers: readonly SellerSummary[];
  onChange: (patch: Partial<BackofficeFilter>) => void;
  /** Nimmt die Straße auch aus der Adresse. */
  onClearStreet: () => void;
}

/** Zeitraum und Suche wie in der CRM-Übersicht, darunter der Verkäufer. */
export default function BackofficeFilters({ filter, sellers, onChange, onClearStreet }: BackofficeFiltersProps) {
  const options = [{ value: ALL_USERS, label: t.allSellers }, ...sellers.map((s) => ({ value: s.id, label: s.open > 0 ? `${s.name} (${s.open})` : s.name }))];
  return (
    <div className="space-y-7">
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
        <OverviewSelectRow icon={User} tone="blue" title={t.seller} value={filter.userId} options={options} onChange={(userId) => onChange({ userId })} />
      </GlassSection>
    </div>
  );
}
