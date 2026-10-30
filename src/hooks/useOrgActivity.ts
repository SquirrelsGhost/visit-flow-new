import { useEffect, useMemo, useRef, useState } from "react";
import type { Vertical } from "../lib/battle/battleCategories";
import { memberStats } from "../lib/overview/manageLogic";
import type { TeamData } from "../lib/overview/teamTypes";
import { localDay } from "../lib/overview/todayStats";
import { loadActivity } from "../lib/teams/orgApi";
import { useNow } from "./useNow";

type Activity = Pick<TeamData, "products" | "doors">;
const MINUTE = 60_000;

/**
 * Zahlen für die Teams, die ein Admin aufgeklappt hat: jedes Team wird beim ersten Aufklappen einmal geladen
 * (v1 /products/team/:id und /doors/team/:id ab Monatsanfang), nicht alle auf einmal.
 */
export function useOrgActivity(teamIds: readonly string[], vertical: Vertical) {
  const now = useNow(MINUTE);
  const today = localDay(now);
  const scope = `${vertical}|${today}`;
  const [loaded, setLoaded] = useState<{ scope: string; teams: Record<string, Activity> }>({ scope, teams: {} });
  const pending = useRef(new Set<string>());
  const teams = useMemo(() => (loaded.scope === scope ? loaded.teams : {}), [loaded.scope, loaded.teams, scope]);
  const missing = teamIds.filter((id) => id && !teams[id]).join(",");

  useEffect(() => {
    if (!missing) return;
    const start = new Date(`${today.slice(0, 7)}-01T00:00:00`);
    const end = new Date(`${today}T12:00:00`);
    for (const id of missing.split(",")) {
      const key = `${scope}|${id}`;
      if (pending.current.has(key)) continue;
      pending.current.add(key);
      void loadActivity(id, vertical, start, end)
        .then((activity) => setLoaded((prev) => ({ scope, teams: { ...(prev.scope === scope ? prev.teams : {}), [id]: activity } })))
        .catch(() => undefined)
        .finally(() => pending.current.delete(key));
    }
  }, [missing, scope, today, vertical]);

  const stats = useMemo(() => {
    const all = Object.values(teams);
    return memberStats({ users: [], products: all.flatMap((a) => a.products), doors: all.flatMap((a) => a.doors) }, now);
  }, [teams, now]);

  return { stats, loadedTeams: new Set(Object.keys(teams)), now };
}
