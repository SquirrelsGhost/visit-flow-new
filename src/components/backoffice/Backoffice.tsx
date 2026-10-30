// Filter, Auswahl und Dialoge leben im Browser
"use client";

import { RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { useBackoffice } from "../../hooks/useBackoffice";
import { useStreetParam } from "../../hooks/useStreetParam";
import { hasDemoSession } from "../../lib/auth/demoSession";
import { actionable } from "../../lib/backoffice/backofficeLogic";
import type { BackofficeAction } from "../../lib/backoffice/backofficeTypes";
import type { AdminSale, CustomerGroup } from "../../lib/crmOverview/overviewTypes";
import { backofficeTexts as t } from "../../texts/backofficeTexts";
import CrmSkeleton from "../crm/CrmSkeleton";
import GlassBody from "../glass/GlassBody";
import GlassFlow from "../glass/GlassFlow";
import GlassFlowItem from "../glass/GlassFlowItem";
import GlassRow from "../glass/GlassRow";
import GlassSection from "../glass/GlassSection";
import BackofficeAddon from "./BackofficeAddon";
import BackofficeBulkBar from "./BackofficeBulkBar";
import BackofficeDialog, { type BackofficeConfirm } from "./BackofficeDialog";
import BackofficeFilters from "./BackofficeFilters";
import BackofficeHero from "./BackofficeHero";
import BackofficeList from "./BackofficeList";
import BackofficeSellers from "./BackofficeSellers";

interface BackofficeProps {
  admin: boolean;
}

/**
 * Team-Backoffice: Verkäufe des eigenen Teams prüfen und entscheiden (bestätigen, stornieren, löschen).
 * Handy: Kopf, Filter, Liste, Team. iPad quer: links Kopf, Filter, Team; rechts die Liste.
 */
export default function Backoffice({ admin }: BackofficeProps) {
  const link = useStreetParam();
  const b = useBackoffice(link.street);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selecting, setSelecting] = useState(false);
  const [picked, setPicked] = useState<ReadonlySet<string>>(new Set());
  const [confirm, setConfirm] = useState<BackofficeConfirm | null>(null);

  const selected = useMemo(() => b.shown.filter((s) => picked.has(s.id)), [b.shown, picked]);
  const selectedIds = useMemo(() => new Set(selected.map((s) => s.id)), [selected]);
  const allSelected = b.shown.length > 0 && selected.length === b.shown.length;

  const setSelectingMode = (on: boolean) => {
    setSelecting(on);
    setPicked(new Set());
  };
  const toggleGroup = (group: CustomerGroup) => {
    const ids = group.sales.map((s) => s.id);
    const all = ids.every((id) => selectedIds.has(id));
    const next = new Set(selectedIds);
    ids.forEach((id) => (all ? next.delete(id) : next.add(id)));
    setPicked(next);
  };
  const ask = (action: BackofficeAction, sales: readonly AdminSale[]) => {
    const list = actionable(sales, action === "complete" ? "completed" : action === "cancel" ? "cancelled" : undefined);
    if (list.length > 0) setConfirm({ action, sales: list });
  };
  const confirmed = async ({ action, sales }: BackofficeConfirm, reason?: string) => {
    await b.decide(action, sales.map((s) => s.id), reason);
    setConfirm(null);
    if (selecting) setSelectingMode(false);
  };

  if (b.loading) {
    return (
      <div className="mx-auto max-w-xl px-4 pt-5">
        <CrmSkeleton />
      </div>
    );
  }
  return (
    <>
      <GlassBody layout="wide">
        <GlassFlow ratio="aside">
          <GlassFlowItem col="left">
            <BackofficeHero stats={b.stats} admin={admin} demo={hasDemoSession()} onShowOpen={() => b.setFilter({ status: "open" })} />
          </GlassFlowItem>
          <GlassFlowItem col="left">
            <BackofficeFilters filter={b.filter} sellers={b.sellers} onChange={b.setFilter} onClearStreet={link.clear} />
          </GlassFlowItem>
          <GlassFlowItem col="right">
            <div className="space-y-7">
            {b.failed && (
              <GlassSection>
                <GlassRow icon={RefreshCw} tone="red" title={t.loadError} subtitle={t.retry} onClick={() => void b.reload()} />
              </GlassSection>
            )}
            <BackofficeList
              status={b.filter.status}
              counts={b.counts}
              onStatus={(status) => b.setFilter({ status })}
              groups={b.groups}
              visible={b.visible}
              expandedId={expandedId}
              selecting={selecting}
              selectedIds={selectedIds}
              busy={b.busy}
              onSelecting={setSelectingMode}
              onMore={b.showMore}
              onToggle={(id) => setExpandedId((cur) => (cur === id ? null : id))}
              onSelect={toggleGroup}
              onAction={ask}
            />
            </div>
          </GlassFlowItem>
          <GlassFlowItem col="left">
            <BackofficeSellers sellers={b.sellers} activeId={b.filter.userId} onPick={(userId) => b.setFilter({ userId })} />
          </GlassFlowItem>
          <GlassFlowItem col="left">
            <BackofficeAddon admin={admin} />
          </GlassFlowItem>
        </GlassFlow>
      </GlassBody>
      <BackofficeBulkBar open={selecting} count={selected.length} allSelected={allSelected} busy={b.busy} onToggleAll={() => setPicked(allSelected ? new Set() : new Set(b.shown.map((s) => s.id)))} onAction={(a) => ask(a, selected)} />
      <BackofficeDialog confirm={confirm} busy={b.busy} onClose={() => setConfirm(null)} onConfirm={(c, r) => void confirmed(c, r)} />
    </>
  );
}
