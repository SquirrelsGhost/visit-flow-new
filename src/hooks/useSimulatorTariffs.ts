import { useEffect, useState } from "react";
import { loadSimulatorTariffs } from "../lib/simulator/simulatorApi";
import type { TariffsByCategory } from "../lib/simulator/simulatorTypes";

export interface SimulatorTariffs {
  tariffs: TariffsByCategory;
  loading: boolean;
  demo: boolean;
}

/** Lädt die Tarife einmal beim Öffnen (v1 useEffect fetchTariffs). */
export function useSimulatorTariffs(): SimulatorTariffs {
  const [state, setState] = useState<SimulatorTariffs>({ tariffs: {}, loading: true, demo: false });
  useEffect(() => {
    let alive = true;
    loadSimulatorTariffs()
      .then(({ tariffs, demo }) => alive && setState({ tariffs, loading: false, demo }))
      .catch(() => alive && setState((s) => ({ ...s, loading: false })));
    return () => {
      alive = false;
    };
  }, []);
  return state;
}
