import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { assignAdvisor, loadExpiring } from "../lib/expiring/expiringApi";
import { countBy, expiringStats, filterContracts, groupByUrgency } from "../lib/expiring/expiringLogic";
import { ALL, type Advisor, type ExpiringContract, type ExpiringFilter } from "../lib/expiring/expiringTypes";
import { feedback } from "../lib/feedback/feedback";
import { expiringTexts as t } from "../texts/expiringTexts";

export const EMPTY_FILTER: ExpiringFilter = { urgency: ALL, category: ALL, city: ALL, assign: "all", query: "", sort: "days" };

const errorText = (e: unknown, fallback: string) => (e instanceof Error && e.message ? e.message : fallback);

/**
 * Verträge, die in den nächsten 90 Tagen auslaufen (v1 ExpiringContractsView): lädt einmal, filtert und
 * sortiert im Browser. Kennzahlen gelten wie in v1 für die gefilterte Liste; Zuweisungen ändern sie sofort.
 */
export function useExpiringContracts() {
  const [contracts, setContracts] = useState<ExpiringContract[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [filter, setFilterState] = useState<ExpiringFilter>(EMPTY_FILTER);
  const request = useRef(0);

  const load = useCallback(() => {
    const id = ++request.current;
    return loadExpiring()
      .then((next) => {
        if (id !== request.current) return;
        setContracts(next);
        setFailed(false);
      })
      .catch((e: unknown) => {
        if (id !== request.current) return;
        setContracts((prev) => prev ?? []);
        setFailed(true);
        toast.error(errorText(e, t.loadError));
      });
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const setFilter = useCallback((patch: Partial<ExpiringFilter>) => setFilterState((f) => ({ ...f, ...patch })), []);

  const all = useMemo(() => contracts ?? [], [contracts]);
  const filtered = useMemo(() => filterContracts(all, filter), [all, filter]);
  const groups = useMemo(() => groupByUrgency(filtered), [filtered]);
  const stats = useMemo(() => expiringStats(filtered), [filtered]);
  /** Ohne den Dringlichkeits-Filter: Zeitachse und Zähler der Kopfkarte springen beim Antippen nicht auf null. */
  const timeline = useMemo(() => filterContracts(all, { ...filter, urgency: ALL, sort: "days" }), [all, filter]);
  const urgencyCounts = useMemo(() => expiringStats(timeline).byUrgency, [timeline]);
  const categories = useMemo(() => countBy(all, (c) => c.category), [all]);
  const cities = useMemo(() => countBy(all, (c) => c.city), [all]);

  const assign = useCallback(async (contract: ExpiringContract, advisor: Advisor | null) => {
    setBusy(true);
    try {
      await assignAdvisor(contract.id, advisor);
      const at = advisor ? new Date().toISOString() : undefined;
      setContracts((prev) => prev?.map((c) => (c.id === contract.id ? { ...c, advisorId: advisor?.id, advisorName: advisor?.name, assignedAt: at } : c)) ?? prev);
      feedback("success");
      toast.success(advisor ? t.assigned(advisor.name) : t.cleared);
      return true;
    } catch (e) {
      toast.error(errorText(e, t.assignFailed));
      return false;
    } finally {
      setBusy(false);
    }
  }, []);

  return {
    loading: contracts === null,
    failed,
    total: all.length,
    filtered,
    groups,
    stats,
    timeline,
    urgencyCounts,
    categories,
    cities,
    filter,
    setFilter,
    resetFilter: () => setFilterState(EMPTY_FILTER),
    busy,
    assign,
    reload: load,
  };
}
