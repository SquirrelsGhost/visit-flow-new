// Filter, Auswahl und Dialoge leben im Browser
"use client";

import { RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { useCrmOverview } from "../../hooks/useCrmOverview";
import { useStreetParam } from "../../hooks/useStreetParam";
import { hasDemoSession } from "../../lib/auth/demoSession";
import { ALL_USERS, type CustomerGroup } from "../../lib/crmOverview/overviewTypes";
import { crmOverviewTexts as t } from "../../texts/crmOverviewTexts";
import CrmSkeleton from "../crm/CrmSkeleton";
import GlassBody from "../glass/GlassBody";
import GlassRow from "../glass/GlassRow";
import GlassSection from "../glass/GlassSection";
import GlassSplit from "../glass/GlassSplit";
import CustomerList from "./CustomerList";
import OverviewBulkBar from "./OverviewBulkBar";
import OverviewDialogs, { type OverviewConfirm } from "./OverviewDialogs";
import OverviewFilters from "./OverviewFilters";
import OverviewHero from "./OverviewHero";
import OverviewLinks from "./OverviewLinks";

/**
 * CRM-Übersicht für Admins (v1 AdminCRMOverviewPage): Verkäufe aller Nutzer je Kunde, Kennzahlen,
 * Zeitraum, Verkäufer, Probleme, Suche und Sortierung; Produkte einzeln oder gesammelt löschen.
 */
export interface CrmOverviewProps { readonly _?: never; }

export default function CrmOverview() {
  const link = useStreetParam();
  const o = useCrmOverview(link.street);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selecting, setSelecting] = useState(false);
  const [picked, setPicked] = useState<ReadonlySet<string>>(new Set());
  const [confirm, setConfirm] = useState<OverviewConfirm | null>(null);
  const demo = hasDemoSession();

  /** Nur was die Filter noch zeigen, bleibt gewählt. */
  const selected = useMemo(() => o.filtered.filter((s) => picked.has(s.id)), [o.filtered, picked]);
  const selectedIds = useMemo(() => new Set(selected.map((s) => s.id)), [selected]);
  const allSelected = o.filtered.length > 0 && selected.length === o.filtered.length;
  const f = o.filter;
  const filtered = f.range.id !== "all" || f.userId !== ALL_USERS || f.onlyIssues || f.query.trim() !== "" || Boolean(f.street);

  const toggleGroup = (group: CustomerGroup) => {
    const ids = group.sales.map((s) => s.id);
    const all = ids.every((id) => selectedIds.has(id));
    setPicked(() => {
      const next = new Set(selectedIds);
      ids.forEach((id) => (all ? next.delete(id) : next.add(id)));
      return next;
    });
  };
  const setSelectingMode = (on: boolean) => {
    setSelecting(on);
    setPicked(new Set());
  };
  const confirmed = async ({ sales }: OverviewConfirm) => {
    await o.remove(sales.map((s) => s.id));
    setConfirm(null);
    if (selecting) setSelectingMode(false);
  };

  if (o.loading) {
    return (
      <div className="mx-auto max-w-xl px-4 pt-5">
        <CrmSkeleton />
      </div>
    );
  }
  return (
    <>
      <GlassBody layout="wide">
        <GlassSplit
          sticky
          aside={
            <>
              <OverviewHero stats={o.stats} rangeLabel={t.ranges[f.range.id]} demo={demo} onlyIssues={f.onlyIssues} onShowIssues={() => o.setFilter({ onlyIssues: !f.onlyIssues })} />
              <OverviewFilters filter={f} people={o.people} onChange={o.setFilter} onClearStreet={link.clear} />
              <OverviewLinks />
            </>
          }
        >
          {o.failed && (
            <GlassSection>
              <GlassRow icon={RefreshCw} tone="red" title={t.loadError} subtitle={t.retry} onClick={() => void o.reload()} />
            </GlassSection>
          )}
          <CustomerList
            groups={o.groups}
            visible={o.visible}
            shownSales={o.filtered.length}
            totalSales={o.total}
            filtered={filtered}
            expandedId={expandedId}
            selecting={selecting}
            selectedIds={selectedIds}
            onSelecting={setSelectingMode}
            onMore={o.showMore}
            onToggle={(id) => setExpandedId((cur) => (cur === id ? null : id))}
            onSelect={toggleGroup}
            onDeleteSale={(_, sale) => setConfirm({ sales: [sale] })}
            onDeleteGroup={(group) => setConfirm({ sales: group.sales })}
          />
        </GlassSplit>
      </GlassBody>
      <OverviewBulkBar
        open={selecting}
        count={selected.length}
        allSelected={allSelected}
        busy={o.busy}
        onToggleAll={() => setPicked(allSelected ? new Set() : new Set(o.filtered.map((s) => s.id)))}
        onDelete={() => setConfirm({ sales: selected })}
      />
      <OverviewDialogs confirm={confirm} busy={o.busy} onClose={() => setConfirm(null)} onConfirm={(c) => void confirmed(c)} />
    </>
  );
}
