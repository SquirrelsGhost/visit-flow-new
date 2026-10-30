import { useCallback, useEffect, useState } from "react";
import type { Vertical } from "../lib/battle/battleCategories";
import type { ProductCategory } from "../lib/map/productMeta";
import { saleTariffs } from "../lib/map/saleTariffs";
import type { Tariff } from "../lib/tariff/tariffTypes";

interface SaleTariffsState {
  key: string;
  tariffs: Tariff[];
  error: string | null;
}

/** Tarife einer Produkt-Kachel laden, mit "Erneut versuchen" wie in v1. */
export function useSaleTariffs(category: ProductCategory, vertical: Vertical) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<SaleTariffsState | null>(null);
  const key = `${vertical}|${category}|${attempt}`;

  useEffect(() => {
    let alive = true;
    saleTariffs(category, vertical)
      .then((tariffs) => alive && setState({ key, tariffs, error: null }))
      .catch(() => alive && setState({ key, tariffs: [], error: "Tarife konnten nicht geladen werden." }));
    return () => {
      alive = false;
    };
  }, [category, vertical, key]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  const current = state?.key === key ? state : null;
  return { tariffs: current?.tariffs ?? [], error: current?.error ?? null, loading: !current, retry };
}
