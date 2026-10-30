import { useEffect, useState } from "react";
import { loadTariffs } from "../lib/tariff/tariffApi";
import type { Tariff, TariffCategory } from "../lib/tariff/tariffTypes";

const EMPTY: Tariff[] = [];

/** Tarife einer Kategorie samt Ladezustand, damit "noch keine Tarife" nicht beim Laden aufblitzt. */
export function useTariffList(category: TariffCategory): { tariffs: Tariff[]; loading: boolean } {
  const [loaded, setLoaded] = useState<{ category: TariffCategory; tariffs: Tariff[] } | null>(null);

  useEffect(() => {
    let alive = true;
    loadTariffs(category).then((tariffs) => {
      if (alive) setLoaded({ category, tariffs });
    });
    return () => {
      alive = false;
    };
  }, [category]);

  const ready = loaded?.category === category;
  return { tariffs: ready ? loaded.tariffs : EMPTY, loading: !ready };
}

/**
 * Tarife einer Kategorie (v1 useTariffs). Solange die neue Kategorie lädt, gibt es eine leere Liste,
 * damit nie Tarife der vorherigen Kategorie angezeigt werden.
 */
export function useTariffs(category: TariffCategory): Tariff[] {
  return useTariffList(category).tariffs;
}
