import { useEffect, useState } from "react";
import type { Vertical } from "../lib/battle/battleCategories";
import { loadPerformance } from "../lib/team/performanceApi";
import type { PerformanceDay, Period } from "../lib/team/teamPerformance";

interface PerformanceState {
  /** undefined = lädt, null = Laden fehlgeschlagen. */
  days: PerformanceDay[] | null | undefined;
  /** true, solange ein neuer Zeitraum lädt; bis dahin bleiben die bisherigen Zahlen stehen. */
  loading: boolean;
  /** Zeitraum, zu dem `days` gehören (beim Umschalten noch der alte). */
  period: Period;
  reload: () => void;
}

/** Lädt den Verlauf neu, sobald sich Zeitraum, Team oder Sparte ändern; eine überholte Antwort wird verworfen. */
export function useTeamPerformance(teamId: string | undefined, period: Period, vertical: Vertical): PerformanceState {
  const [result, setResult] = useState<{ key: string; period: Period; days: PerformanceDay[] | null } | null>(null);
  const [round, setRound] = useState(0);
  const key = `${teamId ?? "none"}|${period}|${vertical}|${round}`;

  useEffect(() => {
    let alive = true;
    void loadPerformance(teamId, period, vertical).then((days) => alive && setResult({ key, period, days }));
    return () => {
      alive = false;
    };
  }, [teamId, period, vertical, key]);

  return {
    days: result ? result.days : undefined,
    loading: result?.key !== key,
    period: result?.period ?? period,
    reload: () => setRound((n) => n + 1),
  };
}
