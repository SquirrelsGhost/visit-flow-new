import { describe, expect, it } from "vitest";
import { checkMonthChange, tripFieldsOf, type MonthContent } from "../modules/logbook/logbookRules";
import { makeTrip } from "./support/logbookFakes";

const MONTH = "2026-10";
const locked = { lockedAt: "2026-11-01T08:00:00.000Z", reopened: [] };
const open = (trips = [makeTrip()]): MonthContent => ({ trips, lock: null });

const rejects = (prev: MonthContent | null, next: MonthContent) => expect(() => checkMonthChange(MONTH, prev, next)).toThrow();
const accepts = (prev: MonthContent | null, next: MonthContent) => expect(() => checkMonthChange(MONTH, prev, next)).not.toThrow();

describe("Fahrtenbuch-Regeln", () => {
  it("nimmt nur Fahrten aus dem Monat und keine doppelten IDs", () => {
    accepts(null, open());
    rejects(null, open([makeTrip({ date: "2026-11-01" })]));
    rejects(null, open([makeTrip(), makeTrip()]));
  });

  it("schützt abgeschlossene Monate vor Änderungen und Löschen", () => {
    const prev = { trips: [makeTrip()], lock: locked };
    accepts(prev, { trips: [makeTrip()], lock: locked });
    rejects(prev, { trips: [], lock: locked });
    rejects(prev, { trips: [makeTrip({ endKm: 1050, revisions: [{ at: "x", before: tripFieldsOf(makeTrip()) }] })], lock: locked });
    rejects(prev, { trips: [makeTrip(), makeTrip({ id: "t2" })], lock: locked });
  });

  it("öffnet einen Monat nur mit angehängtem Grund", () => {
    const prev = { trips: [makeTrip()], lock: locked };
    rejects(prev, { trips: [makeTrip()], lock: null });
    rejects(prev, { trips: [makeTrip()], lock: { lockedAt: null, reopened: [] } });
    accepts(prev, { trips: [makeTrip()], lock: { lockedAt: null, reopened: [{ at: "2026-11-02", reason: "Tankbeleg nachgereicht" }] } });
  });

  it("behält das Wiederöffnungs-Protokoll", () => {
    const prev = { trips: [], lock: { lockedAt: null, reopened: [{ at: "a", reason: "Grund" }] } };
    accepts(prev, { trips: [], lock: { lockedAt: "b", reopened: prev.lock.reopened } });
    rejects(prev, { trips: [], lock: { lockedAt: "b", reopened: [] } });
  });

  it("verlangt bei geänderten Fahrten eine frühere Fassung", () => {
    const before = makeTrip();
    rejects(open([before]), open([makeTrip({ endKm: 1050 })]));
    rejects(open([before]), open([makeTrip({ createdAt: "2027-01-01T00:00:00.000Z" })]));
    accepts(open([before]), open([makeTrip({ endKm: 1050, revisions: [{ at: "2026-10-06T00:00:00.000Z", before: tripFieldsOf(before) }] })]));
    const revised = makeTrip({ endKm: 1050, revisions: [{ at: "z", before: tripFieldsOf(before) }] });
    rejects(open([revised]), open([makeTrip({ endKm: 1060, revisions: [] })]));
  });

  it("erlaubt Löschen in offenen Monaten", () => {
    accepts(open([makeTrip(), makeTrip({ id: "t2" })]), open([makeTrip()]));
  });
});
