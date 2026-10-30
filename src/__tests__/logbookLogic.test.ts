import { describe, expect, it } from "vitest";
import { checkMonth } from "../lib/logbook/logbookChecks";
import { createTrip, gapTrip, newDraft, reviseTrip, toFields, validateDraft, draftOf } from "../lib/logbook/logbookDraft";
import { logbookCsv } from "../lib/logbook/logbookExport";
import { dailyBars, groupByDay, summarize } from "../lib/logbook/logbookLogic";
import { emptyLogbook, parseLogbook } from "../lib/logbook/logbookSchema";
import type { LogbookData, Trip, TripFields } from "../lib/logbook/logbookTypes";
import { importV1History } from "../lib/logbook/logbookV1Import";
import { visitSuggestion } from "../lib/logbook/logbookVisits";
import type { MapHouse } from "../lib/map/mapTypes";
import { LOGBOOK_TEXTS } from "../texts/logbook/logbookTexts";

const t = LOGBOOK_TEXTS.de;
const NOW = new Date("2026-10-24T18:00:00");
const OCT = { month: 9, year: 2026 };

const base: TripFields = { date: "2026-10-20", startTime: "08:00", endTime: "08:30", startKm: 1000, endKm: 1030, kind: "business", from: "Zuhause", to: "Köln-Ehrenfeld", purpose: "Haustürberatung", partner: "30 Haushalte", detour: "", vehicleId: "car-1" };
const trip = (patch: Partial<TripFields>, created = "2026-10-20T20:00:00"): Trip => createTrip({ ...base, ...patch }, "Max", "manual", new Date(created));
const book = (trips: Trip[], patch: Partial<LogbookData> = {}): LogbookData => ({ ...emptyLogbook(), trips, ...patch });

describe("Fahrtenbuch: Kennzahlen", () => {
  it("summiert Kilometer je Art, Fahrtage und die Pauschale nur für Dienst-km", () => {
    const s = summarize([trip({}), trip({ startKm: 1030, endKm: 1060, kind: "private" }), trip({ date: "2026-10-21", startKm: 1060, endKm: 1100, kind: "commute" })]);
    expect(s).toMatchObject({ totalKm: 100, trips: 3, days: 2, byKind: { business: 30, private: 30, commute: 40 }, allowance: 9 });
    expect(s.businessShare).toBeCloseTo(0.3);
  });

  it("gruppiert nach Tagen mit dem neuesten Tag oben und füllt die Tagesbalken des Monats", () => {
    const trips = [trip({ startTime: "18:00", startKm: 1030, endKm: 1040 }), trip({}), trip({ date: "2026-10-22", startKm: 1040, endKm: 1050 })];
    const days = groupByDay(trips);
    expect(days.map((d) => d.date)).toEqual(["2026-10-22", "2026-10-20"]);
    expect(days[1]!.trips.map((x) => x.startTime)).toEqual(["08:00", "18:00"]);
    const bars = dailyBars(trips, OCT);
    expect(bars).toHaveLength(31);
    expect(bars[19]!.total).toBe(40);
  });
});

describe("Fahrtenbuch: Finanzamt-Check", () => {
  it("meldet Lücken und Überschneidungen im Kilometerstand", () => {
    const issues = checkMonth(book([trip({}), trip({ date: "2026-10-21", startKm: 1052, endKm: 1080 }), trip({ date: "2026-10-22", startKm: 1070, endKm: 1090 })]), OCT, NOW);
    expect(issues.map((i) => [i.kind, i.km])).toEqual([["gap", 22], ["overlap", 10]]);
  });

  it("verlangt bei Dienstfahrten Ziel und Zweck, bei Privatfahrten nichts", () => {
    const issues = checkMonth(book([trip({ purpose: "", to: "" }), trip({ startKm: 1030, endKm: 1040, kind: "private", to: "", purpose: "" })]), OCT, NOW);
    expect(issues).toEqual([expect.objectContaining({ kind: "missing", fields: ["to", "purpose"] })]);
  });

  it("weist auf späte Erfassung und offene Vormonate hin", () => {
    const late = checkMonth(book([trip({}, "2026-10-29T10:00:00")]), OCT, new Date("2026-11-03T10:00:00"));
    expect(late.map((i) => i.kind)).toEqual(["unlocked", "late"]);
    const closed = checkMonth(book([trip({})], { locks: { "2026-10": { lockedAt: "2026-11-01T09:00:00Z", reopened: [] } } }), OCT, new Date("2026-11-03T10:00:00"));
    expect(closed).toEqual([]);
  });

  it("schließt eine Lücke mit einer nachgetragenen Privatfahrt", () => {
    const first = trip({ endTime: "08:30" });
    const second = trip({ date: "2026-10-21", startKm: 1052, endKm: 1080 });
    const [gap] = checkMonth(book([first, second]), OCT, NOW);
    const filled = gapTrip(gap!.afterDate!, gap!.afterTime!, gap!.fromKm!, gap!.toKm!, "car-1", "Max");
    expect(filled).toMatchObject({ kind: "private", startKm: 1030, endKm: 1052, source: "gap" });
    expect(checkMonth(book([first, second, filled]), OCT, NOW)).toEqual([]);
  });
});

describe("Fahrtenbuch: Formular", () => {
  it("setzt Kilometerstand und Startort von der letzten Fahrt fort", () => {
    const draft = newDraft(book([trip({})]), 500, NOW);
    expect(draft).toMatchObject({ date: "2026-10-24", startKm: "1030", from: "Köln-Ehrenfeld", kind: "business" });
    expect(newDraft(book([]), 48230, NOW).startKm).toBe("48230");
  });

  it("prüft Kilometer, Uhrzeit und Pflichtfelder", () => {
    const ok = draftOf(base);
    expect(validateDraft(ok)).toEqual({});
    expect(validateDraft({ ...ok, endKm: "990" }).endKm).toBe("kmOrder");
    expect(validateDraft({ ...ok, endKm: "9000" }).endKm).toBe("kmTooFar");
    expect(validateDraft({ ...ok, endKm: "1,5" }).endKm).toBe("number");
    expect(validateDraft({ ...ok, endTime: "07:00" }).endTime).toBe("timeOrder");
    expect(validateDraft({ ...ok, purpose: " " }).purpose).toBe("required");
    expect(validateDraft({ ...ok, kind: "private", purpose: "", to: "" })).toEqual({});
  });

  it("protokolliert Änderungen mit der alten Fassung und lässt Unverändertes in Ruhe", () => {
    const original = trip({});
    expect(reviseTrip(original, toFields(draftOf(original)))).toBe(original);
    const changed = reviseTrip(original, { ...base, endKm: 1035 }, new Date("2026-10-21T09:00:00"));
    expect(changed.endKm).toBe(1035);
    expect(changed.revisions).toEqual([{ at: new Date("2026-10-21T09:00:00").toISOString(), before: expect.objectContaining({ endKm: 1030 }) }]);
  });
});

describe("Fahrtenbuch: Übernahme, Speicher und Export", () => {
  it("übernimmt je v1-Tag eine Dienstfahrt und überspringt Tage ohne Kilometerstand", () => {
    const v1 = {
      "2026-03-17": { route: [{ customLocation: { name: "Müller", fullAddress: "Hauptstr. 1, Köln" }, purpose: "📅 Termin 14:00", businessPartner: "Müller" }], totalDistance: 42.4, startKm: 12000, startTime: "09:00", endTime: "15:00", driver: "Max" },
      "2026-03-18": { route: [{ customLocation: { name: "X" } }], totalDistance: 10, startKm: 0 },
    };
    const { trips, skipped } = importV1History(v1, "car-1", "Fallback");
    expect(skipped).toBe(1);
    expect(trips).toEqual([expect.objectContaining({ date: "2026-03-17", startKm: 12000, endKm: 12042, to: "Hauptstr. 1, Köln", purpose: "Termin 14:00", partner: "Müller", driver: "Max", source: "v1" })]);
  });

  it("verwirft kaputte Einträge einzeln statt das ganze Fahrtenbuch", () => {
    const parsed = parseLogbook({ version: 1, vehicles: [], trips: [trip({}), { id: "kaputt" }], locks: {} });
    expect(parsed.trips).toHaveLength(1);
    expect(parsed.vehicles).toHaveLength(1);
  });

  it("schreibt eine CSV mit Pflichtspalten, Summen und BOM für Excel", () => {
    const csv = logbookCsv({ trips: [trip({})], vehicles: [{ id: "car-1", name: "Golf", plate: "K-AB 1" }], driver: "Max", period: "Oktober 2026" }, t);
    expect(csv.startsWith("﻿")).toBe(true);
    const [head, row] = csv.slice(1).split("\n");
    expect(head).toContain('"Datum";"Abfahrt";"Ankunft";"Km-Stand Start";"Km-Stand Ende";"Gefahrene km"');
    expect(row).toContain('"20.10.2026";"08:00";"08:30";"1000";"1030";"30";"Dienstfahrt";"Zuhause";"Köln-Ehrenfeld"');
    expect(csv).toContain('"Summe";;;;;"30"');
  });

  it("schlägt aus den Kartenbesuchen eines Tages Gebiet und Haushalte vor, ohne Kundennamen", () => {
    const door = (status: string, ts: string) => ({ id: ts, name: "Familie Geheim", status, timestamp: ts }) as MapHouse["doors"][number];
    const house = (street: string, doors: MapHouse["doors"]) => ({ street, city: "Köln", doors }) as MapHouse;
    const s = visitSuggestion([house("Venloer Str.", [door("N/A", "2026-10-20T14:00:00"), door("Angetroffen → Sale", "2026-10-20T15:00:00")]), house("Glasstr.", [door("N/A", "2026-10-20T16:00:00")]), house("Alt", [door("N/A", "2026-10-19T16:00:00")])], "2026-10-20");
    expect(s).toEqual({ to: "Köln: Venloer Str., Glasstr.", doors: 3, sales: 1, streets: 2 });
    expect(JSON.stringify(s)).not.toContain("Geheim");
  });
});
