import { useCallback, useEffect, useState } from "react";
import { loadStreetData, loadStreetPeople, type StreetPeople } from "../lib/streets/streetApi";
import type { StreetData, StreetDateFilter, StreetView } from "../lib/streets/streetTypes";

/** Personen der Sicht (Admin alle Konten, sonst das Team). undefined = lädt, null = Fehler. */
export function useStreetPeople(view: StreetView) {
  const [people, setPeople] = useState<StreetPeople | null | undefined>(undefined);
  useEffect(() => {
    let alive = true;
    loadStreetPeople(view).then(
      (next) => alive && setPeople(next),
      () => alive && setPeople(null),
    );
    return () => {
      alive = false;
    };
  }, [view]);
  return people;
}

/**
 * Türen und Verkäufe im Zeitraum. Ein Wechsel des Zeitraums lädt neu, die alten Zahlen bleiben bis dahin stehen,
 * damit die Liste nicht flackert. undefined = erstes Laden, null = Fehler.
 */
export function useStreetData(view: StreetView, filter: StreetDateFilter, teamId: string | undefined) {
  const [data, setData] = useState<StreetData | null | undefined>(undefined);
  const [loadedKey, setLoadedKey] = useState("");
  const [version, setVersion] = useState(0);
  const { mode, from, to } = filter;
  const key = [view, mode, from, to, teamId, version].join("|");

  useEffect(() => {
    let alive = true;
    loadStreetData(view, { mode, from, to }, teamId)
      .then(
        (next) => alive && setData(next),
        () => alive && setData((prev) => prev ?? null),
      )
      .finally(() => alive && setLoadedKey([view, mode, from, to, teamId, version].join("|")));
    return () => {
      alive = false;
    };
  }, [view, mode, from, to, teamId, version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);
  return { data, loading: loadedKey !== key, reload };
}
