import { useEffect, useSyncExternalStore } from "react";
import { hasDemoSession } from "../lib/auth/demoSession";
import { readLogbook, subscribeLogbook } from "../lib/logbook/logbookStore";
import { getSyncStatus, requestSync, subscribeSyncStatus, type SyncStatus } from "../lib/logbook/logbookSyncRunner";
import { hasPending, readSyncMeta } from "../lib/logbook/logbookSyncState";

/** Kurz warten, damit mehrere schnelle Änderungen in einem Abgleich hochgehen. */
const DEBOUNCE_MS = 1500;

/**
 * Hält das Fahrtenbuch mit dem Server abgeglichen: beim Öffnen, nach jeder Änderung,
 * wenn das Gerät wieder online ist und wenn die App wieder in den Vordergrund kommt.
 */
export function useLogbookSync(userId: string): SyncStatus {
  const status = useSyncExternalStore(subscribeSyncStatus, getSyncStatus, () => "idle" as const);

  useEffect(() => {
    if (hasDemoSession()) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const now = () => requestSync(userId);
    const later = () => {
      if (!hasPending(readSyncMeta(userId, readLogbook(userId)))) return;
      clearTimeout(timer);
      timer = setTimeout(now, DEBOUNCE_MS);
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") now();
    };
    now();
    const unsubscribe = subscribeLogbook(later);
    window.addEventListener("online", now);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearTimeout(timer);
      unsubscribe();
      window.removeEventListener("online", now);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [userId]);

  return hasDemoSession() ? "idle" : status;
}
