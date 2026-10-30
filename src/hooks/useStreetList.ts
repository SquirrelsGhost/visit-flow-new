import { useDeferredValue, useMemo, useState } from "react";
import { hasDemoSession } from "../lib/auth/demoSession";
import { localDay } from "../lib/overview/todayStats";
import type { StreetPeople } from "../lib/streets/streetApi";
import { buildStreetRows, groupByPlace, rowsOfPeople, searchRows, streetStats } from "../lib/streets/streetGrouping";
import { peopleInView } from "../lib/streets/streetPeople";
import type { StreetRef } from "../lib/streets/streetLinks";
import type { StreetScope } from "../lib/streets/streetScope";
import type { StreetData, StreetDateFilter } from "../lib/streets/streetTypes";
import { streetListTexts } from "../texts/streetListTexts";
import { useStreetData } from "./useStreetData";

export const ALL_GROUPS = "all";

/** Personen der Sicht und, außer beim Admin im Live-Betrieb, nur deren Türen (der Server filtert Strukturleiter selbst). */
export function useScopedPeople(scope: StreetScope, people: StreetPeople | null | undefined) {
  return useMemo(() => {
    const users = people?.users ?? [];
    const inView = peopleInView(scope.view, users, scope.meId, scope.meIsMentor);
    const names = new Map(users.map((u) => [u.id, u.name]));
    const filterDoors = scope.view === "mentor" || (scope.view === "struktur" && hasDemoSession());
    const ids = new Set(inView.map((u) => u.id));
    const restrict = (data: StreetData): StreetData =>
      filterDoors ? { doors: data.doors.filter((d) => ids.has(d.userId)), products: data.products.filter((p) => ids.has(p.userId)) } : data;
    return { inView, names, restrict };
  }, [scope.view, scope.meId, scope.meIsMentor, people]);
}

/**
 * Straßenliste: Zeitraum (Standard heute), Suche und Gruppe filtern die nach Ort gebündelten Straßen.
 * Kommt man mit einer Straße aus dem CRM, startet sie ohne Datum und mit der Straße in der Suche.
 */
export function useStreetList(scope: StreetScope, people: StreetPeople | null | undefined, initial: StreetRef | null = null) {
  const today = localDay(new Date());
  const [filter, setFilter] = useState<StreetDateFilter>(() => ({ mode: initial ? "all" : "day", from: today, to: today }));
  const [query, setQuery] = useState(initial?.street ?? "");
  const [group, setGroup] = useState(ALL_GROUPS);
  const deferredQuery = useDeferredValue(query);
  const { data, loading, reload } = useStreetData(scope.view, filter, scope.teamId);
  const { names, restrict } = useScopedPeople(scope, people);

  const allRows = useMemo(() => (data ? buildStreetRows(restrict(data), (id) => names.get(id), streetListTexts.unknown) : []), [data, restrict, names]);
  const rows = useMemo(() => {
    const groupOf = people?.groupOf ?? {};
    const inGroup = group === ALL_GROUPS ? allRows : rowsOfPeople(allRows, new Set(Object.keys(groupOf).filter((id) => groupOf[id] === group)));
    return searchRows(inGroup, deferredQuery);
  }, [allRows, group, people, deferredQuery]);
  const places = useMemo(() => groupByPlace(rows), [rows]);
  const stats = useMemo(() => streetStats(rows), [rows]);

  const setMode = (mode: StreetDateFilter["mode"]) => setFilter((f) => (mode === "day" ? { mode, from: f.from, to: f.from } : { ...f, mode }));
  const setDates = (from: string, to: string) => setFilter((f) => ({ ...f, from, to: f.mode === "day" ? from : to < from ? from : to }));

  return { filter, setMode, setDates, query, setQuery, group, setGroup, rows, allRows, places, stats, data, loading, reload };
}
