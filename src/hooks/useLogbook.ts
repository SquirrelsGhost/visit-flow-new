import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { hasDemoSession } from "../lib/auth/demoSession";
import { feedback } from "../lib/feedback/feedback";
import { gapTrip } from "../lib/logbook/logbookDraft";
import { emptyLogbook } from "../lib/logbook/logbookSchema";
import { readLogbook, subscribeLogbook, writeLogbook } from "../lib/logbook/logbookStore";
import { markChanged } from "../lib/logbook/logbookSyncState";
import type { LogbookData, LogbookIssue, Trip, Vehicle } from "../lib/logbook/logbookTypes";
import { importV1History, readV1History } from "../lib/logbook/logbookV1Import";
import { readSettings, updateSettings } from "../lib/settings/settingsStore";
import { useLogbookSync } from "./useLogbookSync";
import { useLogbookTexts } from "./useLogbookTexts";

const EMPTY = emptyLogbook();

/** Der Kilometerstand der Einstellungen folgt der letzten Fahrt, wie v1 ihn nach jeder Route fortschrieb. */
function syncSettingsKm(trip: Trip, data: LogbookData) {
  if (trip.vehicleId !== data.activeVehicleId) return;
  const current = readSettings().currentKm;
  if (current === undefined || trip.endKm > current) updateSettings({ currentKm: trip.endKm });
}

/**
 * Fahrtenbuch eines Nutzers: liest und schreibt den Speicher, übernimmt einmalig den v1-Verlauf
 * und bietet alle Änderungen als Aktionen an. Abgeschlossene Monate lassen sich nicht ändern.
 */
export function useLogbook(userId: string, driver: string) {
  const t = useLogbookTexts();
  const data = useSyncExternalStore(subscribeLogbook, () => readLogbook(userId), () => EMPTY);

  const sync = useLogbookSync(userId);
  useEffect(() => {
    if (sync === "rejected") toast.warning(t.syncRejected);
  }, [sync, t]);

  /** Jede Änderung merkt sich die betroffenen Monate für den Abgleich (Demo bleibt nur im Tab). */
  const mutate = useCallback(
    (change: (d: LogbookData) => LogbookData) => {
      const before = readLogbook(userId);
      const after = change(before);
      if (!hasDemoSession()) markChanged(userId, before, after);
      writeLogbook(userId, after);
    },
    [userId],
  );

  useEffect(() => {
    if (hasDemoSession() || readLogbook(userId).importedV1) return;
    const current = readLogbook(userId);
    const { trips } = importV1History(readV1History(), current.activeVehicleId, driver);
    const known = new Set(current.trips.filter((x) => x.source === "v1").map((x) => x.date));
    const fresh = trips.filter((x) => !known.has(x.date));
    mutate((d) => ({ ...d, importedV1: true, trips: [...d.trips, ...fresh] }));
    if (fresh.length > 0) toast.success(t.imported(fresh.length));
  }, [userId, driver, mutate, t]);

  const saveTrip = useCallback(
    (trip: Trip) => {
      const exists = readLogbook(userId).trips.some((x) => x.id === trip.id);
      mutate((d) => ({ ...d, trips: exists ? d.trips.map((x) => (x.id === trip.id ? trip : x)) : [...d.trips, trip] }));
      syncSettingsKm(trip, readLogbook(userId));
      feedback("success");
      toast.success(exists ? t.updated : t.saved);
    },
    [mutate, userId, t],
  );

  const deleteTrip = useCallback(
    (id: string) => {
      mutate((d) => ({ ...d, trips: d.trips.filter((x) => x.id !== id) }));
      toast.success(t.deleted);
    },
    [mutate, t],
  );

  const fillGap = useCallback(
    (issue: LogbookIssue, vehicleId: string) => {
      if (issue.fromKm === undefined || issue.toKm === undefined) return;
      const trip = gapTrip(issue.afterDate ?? issue.date, issue.afterTime ?? "", issue.fromKm, issue.toKm, vehicleId, driver);
      mutate((d) => ({ ...d, trips: [...d.trips, trip] }));
      feedback("success");
      toast.success(t.gapFilled);
    },
    [mutate, driver, t],
  );

  const setLock = useCallback(
    (month: string, locked: boolean, reason: string, label: string) => {
      mutate((d) => {
        const prev = d.locks[month] ?? { lockedAt: null, reopened: [] };
        const at = new Date().toISOString();
        const next = locked ? { ...prev, lockedAt: at } : { lockedAt: null, reopened: [...prev.reopened, { at, reason }] };
        return { ...d, locks: { ...d.locks, [month]: next } };
      });
      feedback(locked ? "success" : "tap");
      toast.success(locked ? t.locked(label) : t.reopened(label));
    },
    [mutate, t],
  );

  const saveVehicles = useCallback(
    (vehicles: Vehicle[], activeVehicleId: string) => {
      mutate((d) => ({ ...d, vehicles, activeVehicleId }));
      toast.success(t.vehicleSaved);
    },
    [mutate, t],
  );

  const vehicle = useMemo(() => data.vehicles.find((v) => v.id === data.activeVehicleId) ?? data.vehicles[0]!, [data]);

  return { data, vehicle, sync, saveTrip, deleteTrip, fillGap, setLock, saveVehicles };
}
