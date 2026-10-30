// Filter, Aufklappen und Zuweisen leben im Browser
"use client";

import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { useExpiringContracts } from "../../hooks/useExpiringContracts";
import { hasDemoSession } from "../../lib/auth/demoSession";
import { DAYS_WINDOW, type ExpiringContract } from "../../lib/expiring/expiringTypes";
import { expiringTexts as t } from "../../texts/expiringTexts";
import CrmSkeleton from "../crm/CrmSkeleton";
import GlassBody from "../glass/GlassBody";
import GlassRow from "../glass/GlassRow";
import GlassSection from "../glass/GlassSection";
import GlassSplit from "../glass/GlassSplit";
import AssignAdvisorSheet from "./AssignAdvisorSheet";
import ContractList from "./ContractList";
import ExpiringFilters, { isFiltered } from "./ExpiringFilters";
import ExpiringHero from "./ExpiringHero";

/**
 * Verträge vor Ablauf für Admins (v1 ExpiringContractsView): Kunden, deren Tarif in den nächsten 90 Tagen endet,
 * nach Restlaufzeit sortiert und nach Dringlichkeit, Kategorie, Ort und Zuweisung gefiltert; Leads an Berater geben.
 */
export interface ExpiringContractsProps { readonly _?: never; }

export default function ExpiringContracts() {
  const e = useExpiringContracts();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [assigning, setAssigning] = useState<ExpiringContract | null>(null);
  const demo = hasDemoSession();

  if (e.loading) {
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
              <ExpiringHero
                stats={e.stats}
                timeline={e.timeline}
                counts={e.urgencyCounts}
                urgency={e.filter.urgency}
                window={DAYS_WINDOW}
                demo={demo}
                onUrgency={(urgency) => e.setFilter({ urgency })}
              />
              <ExpiringFilters filter={e.filter} categories={e.categories} cities={e.cities} onChange={e.setFilter} onReset={e.resetFilter} />
            </>
          }
        >
          {e.failed && (
            <GlassSection>
              <GlassRow icon={RefreshCw} tone="red" title={t.loadError} subtitle={t.retry} onClick={() => void e.reload()} />
            </GlassSection>
          )}
          <ContractList
            groups={e.groups}
            shown={e.filtered.length}
            total={e.total}
            window={DAYS_WINDOW}
            filtered={isFiltered(e.filter)}
            expandedId={expandedId}
            onToggle={(id) => setExpandedId((cur) => (cur === id ? null : id))}
            onAssign={setAssigning}
          />
        </GlassSplit>
      </GlassBody>
      <AssignAdvisorSheet contract={assigning} busy={e.busy} onClose={() => setAssigning(null)} onAssign={e.assign} />
    </>
  );
}
