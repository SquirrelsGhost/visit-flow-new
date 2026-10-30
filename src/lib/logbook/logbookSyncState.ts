import { readPreference, writePreference } from "../preferences";
import { emptyLogbook } from "./logbookSchema";
import { monthContent, monthKeys, stableJson } from "./logbookMonths";
import type { LogbookData } from "./logbookTypes";

/** Stand je Monat auf dem Server (`rev`) und ob es hier noch ungesicherte Änderungen gibt. */
export interface SyncEntry {
  rev: number;
  dirty: boolean;
}

export interface SyncMeta {
  months: Record<string, SyncEntry>;
  profile: SyncEntry;
  /** Serverzeit des letzten Abgleichs; danach kommen nur geänderte Monate. */
  syncedAt: string | null;
}

const keyOf = (userId: string) => `vf_logbook_sync_${userId}`;

const profileOf = (data: LogbookData) => stableJson({ vehicles: data.vehicles, activeVehicleId: data.activeVehicleId });

/** Noch nie abgeglichen: alles, was hier liegt, muss auf den Server. */
function initialMeta(data: LogbookData): SyncMeta {
  const months = Object.fromEntries(monthKeys(data).map((month) => [month, { rev: 0, dirty: true }]));
  return { months, profile: { rev: 0, dirty: profileOf(data) !== profileOf(emptyLogbook()) }, syncedAt: null };
}

export function readSyncMeta(userId: string, data: LogbookData): SyncMeta {
  const raw = readPreference(keyOf(userId));
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as SyncMeta;
      if (parsed && typeof parsed.months === "object" && parsed.profile) return parsed;
    } catch {
      // kaputter Stand: wie neu abgleichen
    }
  }
  return initialMeta(data);
}

export function writeSyncMeta(userId: string, meta: SyncMeta): void {
  writePreference(keyOf(userId), JSON.stringify(meta));
}

export const hasPending = (meta: SyncMeta) => meta.profile.dirty || Object.values(meta.months).some((entry) => entry.dirty);

/** Merkt nach einer lokalen Änderung, welche Monate und ob die Fahrzeuge neu auf den Server müssen. */
export function markChanged(userId: string, before: LogbookData, after: LogbookData): void {
  const meta = readSyncMeta(userId, before);
  for (const month of new Set([...monthKeys(before), ...monthKeys(after)])) {
    if (stableJson(monthContent(before, month)) === stableJson(monthContent(after, month))) continue;
    meta.months[month] = { rev: meta.months[month]?.rev ?? 0, dirty: true };
  }
  if (profileOf(before) !== profileOf(after)) meta.profile = { ...meta.profile, dirty: true };
  writeSyncMeta(userId, meta);
}
