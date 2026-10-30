import type { LogbookMonthInput, LogbookMonthView, LogbookProfileInput, LogbookProfileView, LogbookView } from "@/shared/logbook/logbookSchema";
import { apiCall } from "../apiClient";
import { mergeMonth, monthContent, sameContent, withMonth, type MonthContent } from "./logbookMonths";
import { readLogbook, writeLogbook } from "./logbookStore";
import { hasPending, readSyncMeta, writeSyncMeta, type SyncMeta } from "./logbookSyncState";
import type { LogbookData } from "./logbookTypes";

/** synced = alles auf dem Server, offline = Änderungen warten, rejected = Server hat einen Monat abgelehnt und seinen Stand geliefert. */
export type SyncResult = "synced" | "offline" | "rejected";

type Conflict<T> = { current?: T | null };

const meta = (userId: string) => readSyncMeta(userId, readLogbook(userId));
const saveMeta = (userId: string, change: (m: SyncMeta) => void) => {
  const m = meta(userId);
  change(m);
  writeSyncMeta(userId, m);
};
/** Immer auf dem frischen Stand ändern: Der Nutzer kann während des Abgleichs weiter erfassen. */
const update = (userId: string, change: (d: LogbookData) => LogbookData) => {
  const before = readLogbook(userId);
  const after = change(before);
  if (after !== before) writeLogbook(userId, after);
};
const contentOf = (view: LogbookMonthView): MonthContent => ({ trips: view.trips, lock: view.lock });

/** Übernimmt Monate vom Server. Hier ungesicherte Monate werden zusammengeführt statt überschrieben. */
function applyPull(userId: string, view: LogbookView, full: boolean): void {
  for (const month of view.months) {
    const entry = meta(userId).months[month.month];
    const local = monthContent(readLogbook(userId), month.month);
    if (entry?.dirty && entry.rev === month.rev) continue;
    const next = entry?.dirty ? mergeMonth(local, contentOf(month)) : contentOf(month);
    if (!sameContent(local, next)) update(userId, (d) => withMonth(d, month.month, next));
    saveMeta(userId, (m) => (m.months[month.month] = { rev: month.rev, dirty: Boolean(entry?.dirty) && !sameContent(next, contentOf(month)) }));
  }
  const profile = view.profile;
  saveMeta(userId, (m) => {
    if (profile.rev > m.profile.rev && !m.profile.dirty) {
      update(userId, (d) => ({ ...d, vehicles: profile.vehicles, activeVehicleId: profile.activeVehicleId }));
    }
    m.profile.rev = Math.max(m.profile.rev, profile.rev);
    if (full || m.syncedAt === null || view.syncedAt > m.syncedAt) m.syncedAt = view.syncedAt;
  });
}

async function pull(userId: string, full: boolean): Promise<boolean> {
  const since = full ? null : meta(userId).syncedAt;
  const res = await apiCall<LogbookView>(`/logbook${since ? `?since=${encodeURIComponent(since)}` : ""}`);
  if (!res.body.success) return false;
  applyPull(userId, res.body.data, full);
  return true;
}

type PushOutcome = "ok" | "offline" | "rejected";

async function pushMonth(userId: string, month: string, attempt = 0): Promise<PushOutcome> {
  const content = monthContent(readLogbook(userId), month);
  const body: LogbookMonthInput = { baseRev: meta(userId).months[month]?.rev ?? 0, ...content };
  const res = await apiCall<LogbookMonthView>(`/logbook/months/${month}`, { method: "PUT", body: JSON.stringify(body) });
  if (res.body.success) {
    const saved = res.body.data;
    const changedMeanwhile = !sameContent(content, monthContent(readLogbook(userId), month));
    saveMeta(userId, (m) => (m.months[month] = { rev: saved.rev, dirty: changedMeanwhile }));
    return "ok";
  }
  const current = (res.body as Conflict<LogbookMonthView>).current;
  if (res.status === 409 && attempt === 0) {
    const server: MonthContent = current ? contentOf(current) : { trips: [], lock: null };
    update(userId, (d) => withMonth(d, month, mergeMonth(monthContent(d, month), server)));
    saveMeta(userId, (m) => (m.months[month] = { rev: current?.rev ?? 0, dirty: true }));
    return pushMonth(userId, month, 1);
  }
  if (res.status === 400 || res.status === 403 || res.status === 409) {
    // Der Server-Stand gilt; der nächste volle Abgleich holt ihn
    saveMeta(userId, (m) => (m.months[month] = { rev: m.months[month]?.rev ?? 0, dirty: false }));
    return "rejected";
  }
  return "offline";
}

async function pushProfile(userId: string): Promise<PushOutcome> {
  const d = readLogbook(userId);
  const vehicles = d.vehicles.map((v) => ({ id: v.id, name: v.name.slice(0, 120), plate: v.plate.slice(0, 20) }));
  const body: LogbookProfileInput = { baseRev: meta(userId).profile.rev, vehicles, activeVehicleId: d.activeVehicleId, importedV1: d.importedV1 };
  const res = await apiCall<LogbookProfileView>("/logbook/profile", { method: "PUT", body: JSON.stringify(body) });
  if (res.body.success) {
    const rev = res.body.data.rev;
    saveMeta(userId, (m) => (m.profile = { rev, dirty: false }));
    return "ok";
  }
  const current = (res.body as Conflict<LogbookProfileView>).current;
  // Fahrzeuge: das zuletzt speichernde Gerät gewinnt
  if (res.status === 409 && current) {
    saveMeta(userId, (m) => (m.profile.rev = current.rev));
    return pushProfile(userId);
  }
  return res.status === 400 ? "rejected" : "offline";
}

/**
 * Gleicht das Fahrtenbuch mit dem Server ab: erst holen, was andere Geräte geändert haben,
 * dann die hier geänderten Monate hochladen. Ohne Verbindung bleibt alles auf dem Gerät und
 * geht beim nächsten Abgleich hoch.
 */
export async function syncLogbook(userId: string): Promise<SyncResult> {
  if (!(await pull(userId, false))) return "offline";
  let rejected = false;
  const months = Object.entries(meta(userId).months).filter(([, e]) => e.dirty).map(([month]) => month);
  for (const month of months) {
    const outcome = await pushMonth(userId, month);
    if (outcome === "offline") return "offline";
    rejected ||= outcome === "rejected";
  }
  if (meta(userId).profile.dirty) {
    const outcome = await pushProfile(userId);
    if (outcome === "offline") return "offline";
    rejected ||= outcome === "rejected";
  }
  if (rejected) await pull(userId, true);
  if (rejected) return "rejected";
  return hasPending(meta(userId)) ? "offline" : "synced";
}
