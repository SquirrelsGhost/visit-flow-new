import { useCallback, useEffect, useState } from "react";
import { loadStart } from "../lib/admin/adminFigures";
import { loadAdminActivity, loadRevenue, loadTasks } from "../lib/admin/adminApi";
import type { AdminActivity, AdminRevenue, AdminTasks } from "../lib/admin/adminTypes";
import { useOrgDirectory } from "./useOrgDirectory";

/** Wie die Teamseiten: alle 60 Sekunden frisch, solange die App sichtbar ist. */
const POLL_MS = 60_000;

export interface AdminDashboardState {
  directory: ReturnType<typeof useOrgDirectory>["directory"];
  /** undefined = lädt, null = Fehler. */
  activity: AdminActivity | null | undefined;
  revenue: AdminRevenue | null | undefined;
  tasks: AdminTasks | undefined;
  reload: () => void;
}

/**
 * Alle Quellen des Admin-Dashboards: Teams und Personen (wie Meine Teams), Verkäufe und Türen aller Nutzer,
 * Abos und offene Anfragen. Jede Quelle lädt für sich, damit eine langsame Antwort die anderen nicht aufhält.
 */
export function useAdminDashboard(): AdminDashboardState {
  const { directory, reload: reloadDirectory } = useOrgDirectory();
  const [activity, setActivity] = useState<AdminActivity | null | undefined>(undefined);
  const [revenue, setRevenue] = useState<AdminRevenue | null | undefined>(undefined);
  const [tasks, setTasks] = useState<AdminTasks | undefined>(undefined);
  const [round, setRound] = useState(0);

  useEffect(() => {
    let alive = true;
    const load = () => {
      const now = new Date();
      void loadAdminActivity(loadStart(now), now).then(
        (next) => alive && setActivity(next),
        () => alive && setActivity((prev) => prev ?? null),
      );
    };
    load();
    void loadRevenue().then((next) => alive && setRevenue(next), () => alive && setRevenue(null));
    void loadTasks().then((next) => alive && setTasks(next), () => alive && setTasks({ whitelist: 0, partners: 0, payments: 0 }));
    const timer = window.setInterval(() => document.visibilityState === "visible" && load(), POLL_MS);
    return () => {
      alive = false;
      window.clearInterval(timer);
    };
  }, [round]);

  const reload = useCallback(() => {
    setActivity(undefined);
    reloadDirectory();
    setRound((n) => n + 1);
  }, [reloadDirectory]);

  return { directory, activity, revenue, tasks, reload };
}
