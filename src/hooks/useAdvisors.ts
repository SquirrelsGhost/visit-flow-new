import { useEffect, useState } from "react";
import { loadAdvisors } from "../lib/expiring/expiringApi";
import type { Advisor } from "../lib/expiring/expiringTypes";

export type AdvisorState = { status: "loading" | "failed" } | { status: "ready"; advisors: Advisor[] };

/** Berater erst laden, wenn das Zuweisen zum ersten Mal geöffnet wird; danach bleibt die Liste. Nach Fehler lädt erneutes Öffnen nach. */
export function useAdvisors(needed: boolean): AdvisorState {
  const [advisors, setAdvisors] = useState<Advisor[] | null>(null);
  const [failed, setFailed] = useState(false);
  const missing = advisors === null;

  useEffect(() => {
    if (!needed || !missing) return;
    let alive = true;
    loadAdvisors().then(
      (list) => {
        if (!alive) return;
        setAdvisors(list);
        setFailed(false);
      },
      () => alive && setFailed(true),
    );
    return () => {
      alive = false;
    };
  }, [needed, missing]);

  if (advisors) return { status: "ready", advisors };
  return { status: failed ? "failed" : "loading" };
}
