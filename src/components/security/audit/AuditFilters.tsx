import { useSecurityTexts } from "../../../hooks/useSecurityTexts";
import { AUDIT_CATEGORIES, type AuditCategory, type AuditFilter } from "../../../lib/security/securityTypes";
import GlassFilterChips from "../../glass/GlassFilterChips";
import GlassSearchField from "../../glass/GlassSearchField";
import { GLASS_FOOTER } from "../../glass/glassStyles";

interface AuditFiltersProps {
  filter: AuditFilter;
  onChange: (patch: Partial<AuditFilter>) => void;
}

/** Filter des Protokolls (v1 AuditLogViewer): Bereich als Plaketten, Suche nach E-Mail, Aktion, Ziel oder IP. */
export default function AuditFilters({ filter, onChange }: AuditFiltersProps) {
  const t = useSecurityTexts().audit;
  return (
    <div className="space-y-3">
      <GlassSearchField value={filter.query} onChange={(query) => onChange({ query })} placeholder={t.search} />
      <GlassFilterChips<AuditCategory | "all">
        label={t.category}
        layoutId="security-audit-category"
        active={filter.category}
        onChange={(category) => onChange({ category })}
        options={[{ id: "all", label: t.all }, ...AUDIT_CATEGORIES.map((id) => ({ id, label: t.categories[id] }))]}
      />
      <p className={GLASS_FOOTER}>{t.searchHint}</p>
    </div>
  );
}
