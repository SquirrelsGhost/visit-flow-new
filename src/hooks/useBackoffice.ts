import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { BackofficeError, deleteTeamSales, loadTeamSales, setSalesStatus } from "../lib/backoffice/backofficeApi";
import { applyStatus, backofficeStats, byStatus, filterBase, sellerSummaries, statusCounts } from "../lib/backoffice/backofficeLogic";
import type { BackofficeAction, BackofficeFilter } from "../lib/backoffice/backofficeTypes";
import { groupByCustomer, rangeFor } from "../lib/crmOverview/overviewLogic";
import { ALL_USERS, type AdminSale } from "../lib/crmOverview/overviewTypes";
import { feedback } from "../lib/feedback/feedback";
import type { StreetRef } from "../lib/streets/streetMatch";
import { backofficeTexts as t } from "../texts/backofficeTexts";
import { useAuth } from "./useAuth";

export const PAGE_SIZE = 30;

const errorText = (e: unknown, fallback: string) => (e instanceof BackofficeError || (e instanceof Error && e.message) ? (e as Error).message : fallback);

/**
 * Verkäufe des eigenen Teams (Admin: aller Teams) zum Prüfen. Lädt einmal, filtert im Browser und zieht
 * Entscheidungen sofort nach. Startet auf "Offen" über den ganzen geladenen Zeitraum, aus der Straßenliste
 * auf "Alle" mit der Straße.
 */
export function useBackoffice(street: StreetRef | null = null) {
  const { user } = useAuth();
  const userId = user?.id;
  const userEmail = user?.email ?? "";
  const teamId = user?.teamId;
  const role = user?.role ?? "berater";
  const roles = user?.roles;
  const permissions = user?.permissions;
  const stableUser = useMemo(
    () => (userId ? { id: userId, email: userEmail, role, roles, teamId, permissions } : null),
    [userId, userEmail, role, roles, teamId, permissions],
  );
  const [sales, setSales] = useState<AdminSale[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [filter, setFilterState] = useState<BackofficeFilter>(() => ({ status: street ? "all" : "open", range: rangeFor("all"), userId: ALL_USERS, query: "", street }));
  const [visible, setVisible] = useState(PAGE_SIZE);
  const request = useRef(0);

  const load = useCallback(() => {
    if (!stableUser) return Promise.resolve();
    const id = ++request.current;
    return loadTeamSales(stableUser)
      .then((next) => {
        if (id !== request.current) return;
        setSales(next);
        setFailed(false);
      })
      .catch((e: unknown) => {
        if (id !== request.current) return;
        setSales((prev) => prev ?? []);
        setFailed(true);
        toast.error(errorText(e, t.loadError));
      });
  }, [stableUser]);

  useEffect(() => {
    void load();
  }, [load]);

  const setFilter = useCallback((patch: Partial<BackofficeFilter>) => {
    setFilterState((f) => ({ ...f, ...patch }));
    setVisible(PAGE_SIZE);
  }, []);

  const all = useMemo(() => sales ?? [], [sales]);
  const base = useMemo(() => filterBase(all, filter), [all, filter]);
  const shown = useMemo(() => byStatus(base, filter.status), [base, filter.status]);
  const groups = useMemo(() => groupByCustomer(shown, "date"), [shown]);
  const counts = useMemo(() => statusCounts(base), [base]);
  const stats = useMemo(() => backofficeStats(all), [all]);
  const sellers = useMemo(() => sellerSummaries(all), [all]);

  /** Bestätigen, stornieren oder löschen; true, wenn alles geklappt hat. */
  const decide = useCallback(async (action: BackofficeAction, ids: readonly string[], reason?: string) => {
    if (ids.length === 0) return true;
    setBusy(true);
    try {
      const done = action === "delete" ? await deleteTeamSales(ids) : await setSalesStatus(ids, action === "complete" ? "completed" : "cancelled", reason);
      const set = new Set(done);
      setSales((prev) => {
        if (!prev) return prev;
        if (action === "delete") return prev.filter((s) => !set.has(s.id));
        return applyStatus(prev, set, action === "complete" ? "completed" : "cancelled", reason);
      });
      if (done.length > 0) {
        feedback(action === "complete" ? "success" : "storno");
        toast.success(t.toasts[action](done.length));
      }
      if (done.length < ids.length) toast.error(t.partly(ids.length - done.length));
      return done.length === ids.length;
    } catch (e) {
      toast.error(errorText(e, t.loadError));
      return false;
    } finally {
      setBusy(false);
    }
  }, []);

  return { loading: sales === null, failed, all, shown, groups, counts, stats, sellers, filter, setFilter, visible, showMore: () => setVisible((n) => n + PAGE_SIZE), busy, decide, reload: load };
}
