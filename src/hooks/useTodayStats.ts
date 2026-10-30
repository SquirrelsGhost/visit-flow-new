import { useEffect, useState } from "react";
import { hasDemoSession } from "../lib/auth/demoSession";
import type { Vertical } from "../lib/battle/battleCategories";
import { readStoredHouses } from "../lib/map/mapStorage";
import { demoTodayHouses } from "../lib/overview/todayDemoData";
import { computeTodayStats, type TodayStats } from "../lib/overview/todayStats";

interface TodayState {
  stats: TodayStats;
  /** true, wenn ein Beispieltag gezeigt wird (Demo ohne eigene Türen). */
  demo: boolean;
}

function load(vertical: Vertical): TodayState {
  const own = computeTodayStats(readStoredHouses(), vertical);
  if (own.doors > 0 || !hasDemoSession()) return { stats: own, demo: false };
  return { stats: computeTodayStats(demoTodayHouses(vertical), vertical), demo: true };
}

/**
 * Tageszahlen der Übersicht (v1 DailyView über DataContext). Quelle sind die auf der Karte gespeicherten Häuser;
 * die Zahlen ziehen nach, wenn die Karte in einem anderen Tab speichert oder die App wieder in den Vordergrund kommt.
 */
export function useTodayStats(vertical: Vertical): TodayState {
  const [state, setState] = useState<TodayState>(() => load(vertical));

  useEffect(() => {
    const refresh = () => setState(load(vertical));
    refresh();
    const onVisible = () => document.visibilityState === "visible" && refresh();
    window.addEventListener("storage", refresh);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("storage", refresh);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [vertical]);

  return state;
}
