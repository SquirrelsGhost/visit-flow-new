import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { deleteSales, loadAdminSales } from "../lib/crmOverview/overviewApi";
import { filterSales, groupByCustomer, overviewStats, rangeFor, salesPeople } from "../lib/crmOverview/overviewLogic";
import { ALL_USERS, type AdminSale, type OverviewFilter } from "../lib/crmOverview/overviewTypes";
import { feedback } from "../lib/feedback/feedback";
import type { StreetRef } from "../lib/streets/streetMatch";
import { crmOverviewTexts as t } from "../texts/crmOverviewTexts";

/** Wie v1: 50 Kunden auf einmal, "Mehr laden" holt die nächsten. */
export const PAGE_SIZE = 50;

const errorText = (e: unknown) => (e instanceof Error && e.message ? e.message : t.loadError);

/**
 * Verkäufe aller Nutzer (v1 AdminCRMOverviewPage): lädt einmal, filtert und bündelt im Browser,
 * löscht Produkte und nimmt sie sofort aus der Liste. Startet wie v1 mit "Heute", aus der Straßenliste
 * mit der Straße über den ganzen Zeitraum.
 */
export function useCrmOverview(street: StreetRef | null = null) {
  const [sales, setSales] = useState<AdminSale[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [filter, setFilterState] = useState<OverviewFilter>(() => ({ range: rangeFor(street ? "all" : "today"), userId: ALL_USERS, onlyIssues: false, query: "", sort: "date", street }));
  const [visible, setVisible] = useState(PAGE_SIZE);
  const request = useRef(0);

  const load = useCallback(() => {
    const id = ++request.current;
    return loadAdminSales()
      .then((next) => {
        if (id !== request.current) return;
        setFailed(false);
        setSales(next);
      })
      .catch((e: unknown) => {
        if (id !== request.current) return;
        setSales((prev) => prev ?? []);
        setFailed(true);
        toast.error(errorText(e));
      });
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const reload = useCallback(() => {
    setFailed(false);
    return load();
  }, [load]);

  const setFilter = useCallback((patch: Partial<OverviewFilter>) => {
    setFilterState((f) => ({ ...f, ...patch }));
    setVisible(PAGE_SIZE);
  }, []);

  const all = useMemo(() => sales ?? [], [sales]);
  const filtered = useMemo(() => filterSales(all, filter), [all, filter]);
  const groups = useMemo(() => groupByCustomer(filtered, filter.sort), [filtered, filter.sort]);
  const stats = useMemo(() => overviewStats(filtered), [filtered]);
  const people = useMemo(() => salesPeople(all), [all]);

  const remove = useCallback(async (ids: readonly string[]) => {
    setBusy(true);
    try {
      const gone = new Set(await deleteSales(ids));
      setSales((prev) => prev?.filter((s) => !gone.has(s.id)) ?? prev);
      if (gone.size > 0) {
        feedback("storno");
        toast.success(t.deleted(gone.size));
      }
      if (gone.size < ids.length) toast.error(t.deleteFailed(ids.length - gone.size));
      return gone.size === ids.length;
    } finally {
      setBusy(false);
    }
  }, []);

  return {
    loading: sales === null,
    failed,
    total: all.length,
    filtered,
    groups,
    stats,
    people,
    filter,
    setFilter,
    visible,
    showMore: () => setVisible((n) => n + PAGE_SIZE),
    busy,
    remove,
    reload,
  };
}
