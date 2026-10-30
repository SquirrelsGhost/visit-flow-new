// Daten, Auswahl und Dialoge der Seite: braucht State und den Browser
"use client";

import { useState } from "react";
import { useAbrechnung } from "../../hooks/useAbrechnung";
import type { useMonthNav } from "../../hooks/useMonthNav";
import { useSelection } from "../../hooks/useSelection";
import { breakdown, EMPTY_FILTER, type PositionFilter } from "../../lib/abrechnung/abrechnungBreakdown";
import { monthKey, monthLabel } from "../../lib/abrechnung/abrechnungFormat";
import { summarize } from "../../lib/abrechnung/abrechnungSummary";
import type { AbrechnungCategory, AbrechnungItem } from "../../lib/abrechnung/abrechnungTypes";
import { abrechnungTexts as t } from "../../texts/abrechnungTexts";
import GlassFlow from "../glass/GlassFlow";
import GlassFlowItem from "../glass/GlassFlowItem";
import BreakdownCard from "./BreakdownCard";
import BulkBar from "./BulkBar";
import ClaimDialog from "./ClaimDialog";
import CrmEntry from "./CrmEntry";
import DeleteDialog, { type DeleteTarget } from "./DeleteDialog";
import MonthResult from "./MonthResult";
import OpenItemsSection from "./OpenItemsSection";
import PositionsSection from "./PositionsSection";
import ReklamationenDialog from "./ReklamationenDialog";
import ReklamationenEntry from "./ReklamationenEntry";
import TrendCard from "./TrendCard";

interface AbrechnungBodyProps {
  category: AbrechnungCategory;
  nav: ReturnType<typeof useMonthNav>;
}

interface MonthView {
  key: number;
  filter: PositionFilter;
  replacing: boolean;
}

/** Inhalt der Abrechnung für einen Bereich: Ergebnis oder Upload, offene Punkte, Verlauf, Aufteilung, Positionen. */
export default function AbrechnungBody({ category, nav }: AbrechnungBodyProps) {
  const s = useAbrechnung(category, nav.ref, nav.goTo);
  const sel = useSelection(s.open);
  const key = monthKey(nav.ref);
  // Filter und "Datei ersetzen" gelten nur für den Monat, in dem sie gesetzt wurden
  const [stored, setStored] = useState<MonthView>({ key, filter: EMPTY_FILTER, replacing: false });
  const view = stored.key === key ? stored : { key, filter: EMPTY_FILTER, replacing: false };
  const patch = (p: Partial<MonthView>) => setStored((v) => ({ ...(v.key === key ? v : view), ...p }));
  const [claim, setClaim] = useState<AbrechnungItem[] | null>(null);
  const [del, setDel] = useState<DeleteTarget | null>(null);
  const [center, setCenter] = useState(false);

  const record = s.loading ? null : s.record;
  const summary = record ? summarize(record) : null;
  const confirmable = sel.selected.filter((i) => i.status === "missing_in_system");

  const takeOver = (items: AbrechnungItem[]) => {
    const ok = items.filter((i) => i.status === "missing_in_system");
    sel.clear();
    void s.run(ok, { kind: "confirm" }, t.takenOver(ok.length, t.salesOne[category]));
  };
  const submitClaim = (items: AbrechnungItem[], reason: string, note: string) => {
    setClaim(null);
    sel.clear();
    void s.run(items, { kind: "reklamation", reason, note }, t.claimed(items.length));
  };
  const confirmDelete = (target: DeleteTarget) => {
    setDel(null);
    if (target.kind === "record") return void s.removeRecord();
    void s.run(sel.selected, { kind: "delete" }, t.removed);
    sel.clear();
  };
  const upload = async (file: File | null, total?: number) => {
    const ok = await s.upload(file, total);
    if (ok) patch({ replacing: false });
    return ok;
  };

  return (
    <>
      <GlassFlow>
        <GlassFlowItem>
          <MonthResult
            loading={s.loading}
            record={record}
            monthRef={nav.ref}
            category={category}
            replacing={view.replacing}
            busy={s.busy}
            onUpload={upload}
            onRecompare={s.recompare}
            onReplace={(replacing) => patch({ replacing })}
            onDelete={() => setDel({ kind: "record", label: monthLabel(nav.ref) })}
          />
        </GlassFlowItem>
        <GlassFlowItem col="right">
          <OpenItemsSection
            open={s.open}
            current={nav.ref}
            selectedIds={sel.selectedIds}
            allSelected={sel.allSelected}
            selectableCount={sel.selectableCount}
            onToggle={sel.toggle}
            onToggleAll={sel.toggleAll}
            onTakeOver={(item) => takeOver([item])}
            onClaim={(item) => setClaim([item])}
          />
        </GlassFlowItem>
        {s.history.length > 0 && <GlassFlowItem><TrendCard history={s.history} selected={nav.ref} onSelect={nav.goTo} /></GlassFlowItem>}
        {record && record.items.length > 0 && (
          <GlassFlowItem col="right">
            <BreakdownCard key={`mix-${key}`} slices={breakdown(record.items, category)} active={view.filter.family} onToggle={(f) => patch({ filter: { ...view.filter, family: view.filter.family === f ? null : f } })} />
          </GlassFlowItem>
        )}
        {record && record.items.length > 0 && (
          <GlassFlowItem col="right">
            <PositionsSection key={`pos-${key}`} items={record.items} category={category} totalsOnly={!!summary?.totalsOnly} filter={view.filter} onFilter={(f) => patch({ filter: { ...view.filter, ...f } })} onTakeOver={(item) => takeOver([item])} onClaim={(item) => setClaim([item])} />
          </GlassFlowItem>
        )}
        <GlassFlowItem><ReklamationenEntry openCount={s.open.filter((i) => i.reklamiert).length} onOpen={() => setCenter(true)} /></GlassFlowItem>
        <GlassFlowItem><CrmEntry /></GlassFlowItem>
      </GlassFlow>
      <BulkBar
        count={sel.selected.length}
        confirmable={confirmable.length}
        busy={s.busy === "action"}
        onClaim={() => setClaim(sel.selected)}
        onTakeOver={() => takeOver(sel.selected)}
        onDelete={() => setDel({ kind: "items", count: sel.selected.length })}
        onClear={sel.clear}
      />
      <ClaimDialog items={claim} onClose={() => setClaim(null)} onSubmit={submitClaim} />
      <DeleteDialog target={del} onClose={() => setDel(null)} onConfirm={confirmDelete} />
      <ReklamationenDialog
        open={center}
        category={category}
        onClose={() => {
          setCenter(false);
          void s.reload(); // erledigte fallen aus den offenen Punkten
        }}
      />
    </>
  );
}
