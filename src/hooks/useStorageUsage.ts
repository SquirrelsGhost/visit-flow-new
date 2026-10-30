import { useCallback, useEffect, useState } from "react";
import { hasDemoSession } from "../lib/auth/demoSession";
import { DEMO_DELAY_MS, DEMO_STORAGE } from "../lib/settings/settingsDemoData";
import { CLOUD_QUOTA_BYTES, localStorageBytes, type StorageUsage } from "../lib/settings/storageUsage";

export interface StorageUsageState {
  usage: StorageUsage | null;
  syncing: boolean;
  lastSync: Date | null;
  /** Gleicht ab und meldet, ob es geklappt hat. */
  sync: () => Promise<boolean>;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Belegung der User-Cloud (v1 StorageSettings). Die Demo zeigt Beispielzahlen; ohne Demo zählt wie im
 * v1-Rückfall der Speicher auf diesem Gerät, bis die Cloud in der v2-API angebunden ist.
 */
export function useStorageUsage(): StorageUsageState {
  const [usage, setUsage] = useState<StorageUsage | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const measure = useCallback(
    () => setUsage(hasDemoSession() ? { ...DEMO_STORAGE } : { used: localStorageBytes(), total: CLOUD_QUOTA_BYTES }),
    [],
  );

  useEffect(() => {
    // Erst nach dem ersten Bild messen, damit der Balken sichtbar von 0 aus wächst
    const frame = window.requestAnimationFrame(measure);
    return () => window.cancelAnimationFrame(frame);
  }, [measure]);

  const sync = useCallback(async () => {
    setSyncing(true);
    await wait(DEMO_DELAY_MS);
    measure();
    setLastSync(new Date());
    setSyncing(false);
    return hasDemoSession();
  }, [measure]);

  return { usage, syncing, lastSync, sync };
}
