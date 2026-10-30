import { hasDemoSession } from "../auth/demoSession";
import { syncLogbook, type SyncResult } from "./logbookSync";

/** idle = noch kein Abgleich (oder Demo), syncing = läuft gerade. */
export type SyncStatus = "idle" | "syncing" | SyncResult;

let status: SyncStatus = "idle";
const listeners = new Set<() => void>();
let running: Promise<void> | null = null;
let again = false;

function setStatus(next: SyncStatus) {
  if (next === status) return;
  status = next;
  listeners.forEach((listener) => listener());
}

export const getSyncStatus = () => status;

export function subscribeSyncStatus(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Startet einen Abgleich. Läuft schon einer, folgt genau einer danach (nie zwei gleichzeitig). */
export function requestSync(userId: string): void {
  if (hasDemoSession()) return;
  if (running) {
    again = true;
    return;
  }
  running = (async () => {
    do {
      again = false;
      setStatus("syncing");
      setStatus(await syncLogbook(userId).catch((): SyncResult => "offline"));
    } while (again);
  })().finally(() => {
    running = null;
  });
}

/** Nur für Tests. */
export function resetSyncRunner(): void {
  status = "idle";
  again = false;
  running = null;
}
