import { useEffect, useState } from "react";
import type { Vertical } from "../lib/battle/battleCategories";
import { TEAM_UPDATED_EVENT } from "../lib/overview/memberApi";
import { loadTeamData } from "../lib/overview/teamApi";
import type { TeamData } from "../lib/overview/teamTypes";

const EMPTY: TeamData = { users: [], products: [], doors: [] };
/** Wie v1 useTeamProducts: alle 30 Sekunden frisch, solange die App sichtbar ist. */
const POLL_MS = 30_000;

/** Team, Verkäufe und Türen im Zeitraum; lädt neu, wenn Sparte oder Zeitraum wechseln. */
export function useTeamData(teamId: string | undefined, vertical: Vertical, start: Date, end: Date) {
  const [state, setState] = useState<{ data: TeamData; loading: boolean; failed: boolean }>({ data: EMPTY, loading: true, failed: false });
  const from = start.getTime();
  const to = end.getTime();

  useEffect(() => {
    let alive = true;
    const load = () =>
      loadTeamData(teamId, vertical, new Date(from), new Date(to)).then(
        (data) => alive && setState({ data, loading: false, failed: false }),
        () => alive && setState((prev) => ({ ...prev, loading: false, failed: true })),
      );
    void load();
    const timer = window.setInterval(() => document.visibilityState === "visible" && void load(), POLL_MS);
    // Nach einer Änderung im Verwaltungs-Reiter sofort neu laden
    const reload = () => void load();
    window.addEventListener(TEAM_UPDATED_EVENT, reload);
    return () => {
      alive = false;
      window.clearInterval(timer);
      window.removeEventListener(TEAM_UPDATED_EVENT, reload);
    };
  }, [teamId, vertical, from, to]);

  return state;
}
