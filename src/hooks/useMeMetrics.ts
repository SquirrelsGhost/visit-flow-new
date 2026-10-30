import { useEffect, useState } from "react";
import { loadMeMetrics } from "../lib/assistant/meApi";
import type { MeMetrics } from "../lib/assistant/meTypes";

/** Lädt die Zahlen des Reiters "Ich" einmal beim Öffnen. undefined = lädt noch, null = keine Daten. */
export function useMeMetrics(): MeMetrics | null | undefined {
  const [metrics, setMetrics] = useState<MeMetrics | null | undefined>(undefined);
  useEffect(() => {
    let alive = true;
    void loadMeMetrics().then((m) => alive && setMetrics(m));
    return () => {
      alive = false;
    };
  }, []);
  return metrics;
}
