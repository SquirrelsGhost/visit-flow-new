import { beforeEach, describe, expect, it, vi } from "vitest";
import type { LogbookMonthView } from "@/shared/logbook/logbookSchema";
import { createTrip } from "../lib/logbook/logbookDraft";
import { mergeMonth } from "../lib/logbook/logbookMonths";
import { emptyLogbook } from "../lib/logbook/logbookSchema";
import { readLogbook, writeLogbook } from "../lib/logbook/logbookStore";
import { syncLogbook } from "../lib/logbook/logbookSync";
import { markChanged, readSyncMeta } from "../lib/logbook/logbookSyncState";
import type { LogbookData, TripFields } from "../lib/logbook/logbookTypes";

const USER = "u1";
const base: TripFields = { date: "2026-10-20", startTime: "08:00", endTime: "08:30", startKm: 1000, endKm: 1030, kind: "business", from: "Zuhause", to: "Köln", purpose: "Haustürberatung", partner: "30 Haushalte", detour: "", vehicleId: "car-1" };
const trip = (patch: Partial<TripFields> = {}) => createTrip({ ...base, ...patch }, "Max", "manual", new Date("2026-10-20T20:00:00Z"));

/** Kleiner Server wie die v2-API: Revision je Monat, 409 mit aktuellem Stand, abgeschlossene Monate gesperrt. */
function fakeServer() {
  const months = new Map<string, LogbookMonthView>();
  let online = true;
  const json = (status: number, body: unknown) => ({ status, json: async () => body }) as Response;
  const fetchFake = vi.fn(async (url: string, init?: RequestInit) => {
    if (!online) throw new TypeError("offline");
    const path = url.replace(/^.*\/api/, "").split("?")[0]!;
    if (path === "/logbook") {
      const profile = { rev: 0, vehicles: emptyLogbook().vehicles, activeVehicleId: "car-1", importedV1: false, updatedAt: null };
      return json(200, { success: true, data: { profile, months: [...months.values()], syncedAt: new Date().toISOString() } });
    }
    const body = JSON.parse(String(init?.body));
    if (path === "/logbook/profile") return json(200, { success: true, data: { ...body, rev: body.baseRev + 1, updatedAt: "x" } });
    const month = path.split("/").pop()!;
    const stored = months.get(month);
    if ((stored?.rev ?? 0) !== body.baseRev) return json(409, { success: false, error: "Konflikt", message: "Konflikt", current: stored ?? null });
    if (stored?.lock?.lockedAt) return json(403, { success: false, error: "Gesperrt", message: "Gesperrt" });
    const saved = { month, rev: body.baseRev + 1, trips: body.trips, lock: body.lock, updatedAt: new Date().toISOString() };
    months.set(month, saved);
    return json(200, { success: true, data: saved });
  });
  vi.stubGlobal("fetch", fetchFake);
  return { months, fetchFake, setOnline: (value: boolean) => (online = value) };
}

/** Lokale Änderung wie in useLogbook: Monat merken, dann speichern. */
function change(fn: (d: LogbookData) => LogbookData) {
  const before = readLogbook(USER);
  const after = fn(before);
  markChanged(USER, before, after);
  writeLogbook(USER, after);
}

describe("Fahrtenbuch-Abgleich", () => {
  let server: ReturnType<typeof fakeServer>;
  beforeEach(() => {
    server = fakeServer();
  });

  it("lädt geänderte Monate hoch und meldet gesichert", async () => {
    const t = trip();
    change((d) => ({ ...d, trips: [t] }));
    expect(await syncLogbook(USER)).toBe("synced");
    expect(server.months.get("2026-10")?.trips).toEqual([t]);
    expect(readSyncMeta(USER, readLogbook(USER)).months["2026-10"]).toEqual({ rev: 1, dirty: false });
  });

  it("behält Änderungen ohne Verbindung und sichert sie später", async () => {
    server.setOnline(false);
    change((d) => ({ ...d, trips: [trip()] }));
    expect(await syncLogbook(USER)).toBe("offline");
    expect(readSyncMeta(USER, readLogbook(USER)).months["2026-10"]?.dirty).toBe(true);
    server.setOnline(true);
    expect(await syncLogbook(USER)).toBe("synced");
  });

  it("übernimmt Fahrten von einem anderen Gerät", async () => {
    const other = trip({ date: "2026-09-02" });
    server.months.set("2026-09", { month: "2026-09", rev: 4, trips: [other], lock: null, updatedAt: "x" });
    expect(await syncLogbook(USER)).toBe("synced");
    expect(readLogbook(USER).trips).toEqual([other]);
  });

  it("führt beide Geräte zusammen, wenn derselbe Monat geändert wurde", async () => {
    const theirs = trip({ startKm: 900, endKm: 950 });
    server.months.set("2026-10", { month: "2026-10", rev: 2, trips: [theirs], lock: null, updatedAt: "x" });
    const mine = trip();
    change((d) => ({ ...d, trips: [mine] }));
    expect(await syncLogbook(USER)).toBe("synced");
    expect(server.months.get("2026-10")?.trips.map((x) => x.id).sort()).toEqual([theirs.id, mine.id].sort());
    expect(server.months.get("2026-10")?.rev).toBe(3);
  });

  it("nimmt den Server-Stand, wenn der Monat dort abgeschlossen ist", async () => {
    const closed = trip();
    const lock = { lockedAt: "2026-11-01T00:00:00Z", reopened: [] };
    server.months.set("2026-10", { month: "2026-10", rev: 1, trips: [closed], lock, updatedAt: "x" });
    await syncLogbook(USER);
    change((d) => ({ ...d, trips: [] }));
    expect(await syncLogbook(USER)).toBe("rejected");
    expect(readLogbook(USER).trips).toEqual([closed]);
  });

  it("lässt bei der Zusammenführung die Fahrt mit mehr Fassungen gewinnen", () => {
    const a = trip();
    const edited = { ...a, endKm: 1040, revisions: [{ at: "y", before: base }] };
    expect(mergeMonth({ trips: [a], lock: null }, { trips: [edited], lock: null }).trips).toEqual([edited]);
  });
});
