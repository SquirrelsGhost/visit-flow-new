import { useCallback, useEffect, useState } from "react";
import { TEAM_UPDATED_EVENT } from "../lib/overview/memberApi";
import { loadDirectory } from "../lib/teams/orgApi";
import type { OrgDirectory } from "../lib/teams/orgTypes";

/** Alle Teams und Personen für den Admin; lädt nach jeder Änderung an einer Person neu. undefined = lädt, null = Fehler. */
export function useOrgDirectory() {
  const [directory, setDirectory] = useState<OrgDirectory | null | undefined>(undefined);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let alive = true;
    const load = () => loadDirectory().then((next) => alive && setDirectory(next), () => alive && setDirectory((prev) => prev ?? null));
    void load();
    window.addEventListener(TEAM_UPDATED_EVENT, load);
    return () => {
      alive = false;
      window.removeEventListener(TEAM_UPDATED_EVENT, load);
    };
  }, [version]);

  const reload = useCallback(() => {
    setDirectory(undefined);
    setVersion((v) => v + 1);
  }, []);

  return { directory, reload };
}
