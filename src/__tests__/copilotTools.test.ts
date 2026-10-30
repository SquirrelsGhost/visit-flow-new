import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { AuthUser } from "@/shared/auth/authSchemas";
import { writeStoredHouses } from "../lib/map/mapStorage";
import type { MapHouse } from "../lib/map/mapTypes";
import { findAppointmentHouse } from "../lib/copilot/tools/appointmentTool";
import { availableTools } from "../lib/copilot/tools/copilotToolAccess";
import { readToolCalls } from "../lib/copilot/tools/copilotToolCalls";
import { getAppointments, getOpenDoors, getToday } from "../lib/copilot/tools/mapReadTools";
import { runToolCalls } from "../lib/copilot/tools/copilotToolRunner";

const NOW = new Date(2026, 9, 24, 18, 0).getTime();
const HOUR = 3_600_000;
const berater = { id: "u1", email: "b@x.de", name: "Bea Berater", role: "berater" } as AuthUser;
const lead = { ...berater, role: "teamleiter" } as AuthUser;

function house(id: string, street: string, number: string, status: MapHouse["status"], hoursAgo: number, extra: Partial<MapHouse["doors"][number]> = {}): MapHouse {
  const at = NOW - hoursAgo * HOUR;
  return {
    id, street, houseNumber: number, zipCode: "1", city: "Ort", type: "EFH", latitude: 0, longitude: 0, status, updatedAt: at,
    doors: status === "offen" ? [] : [{ id: `${id}d`, name: "Haupteingang", status, timestamp: new Date(at).toISOString(), ...extra }],
  };
}

const ctx = (message = "") => ({ user: berater, vertical: "telco" as const, message, now: NOW });

beforeEach(() => {
  writeStoredHouses([
    house("a", "Lindenstraße", "4", "N/A", 2),
    house("b", "Lindenstraße", "6", "N/A", 30),
    house("c", "Hauptstraße", "12", "Angetroffen → Termin", 50, { appointmentDate: "2026-10-26", appointmentTime: "17:30" }),
    house("d", "Hauptstraße", "14", "Angetroffen → Sale", 1),
    { ...house("e", "Teamweg", "1", "N/A", 1), isTeam: true },
  ]);
});
afterEach(() => window.localStorage.clear());

describe("Werkzeuge der App", () => {
  it("bietet nur an, was Rolle und Sparte erlauben", () => {
    const own = availableTools(berater, "telco");
    expect(own).toContain("get_today");
    expect(own).toContain("schedule_appointment");
    expect(own).not.toContain("get_team_today");
    expect(availableTools(lead, "telco")).toContain("get_team_today");
    expect(availableTools(berater, "energy")).not.toContain("open_calculator");
  });

  it("liest Aufrufe vom Server und bestimmt die Art selbst", () => {
    const calls = readToolCalls([{ id: "1", name: "get_today", kind: "confirm", args: {} }, { id: "2", name: "rm_rf" }, { id: "3", name: "open_page", args: { page: "crm" }, arguments: '{"page":"crm"}' }]);
    expect(calls.map((c) => [c.name, c.kind])).toEqual([["get_today", "read"], ["open_page", "open"]]);
  });

  it("zählt Tag und Woche ohne Teamhäuser", () => {
    const result = getToday(ctx());
    expect(result.today).toMatchObject({ doors: 2, sales: 1 });
    expect(result.last7Days.doors).toBe(4);
  });

  it("gibt offene Chancen nur mit Straßennamen weiter", () => {
    const result = getOpenDoors({ limit: 5 }, ctx());
    expect(result.streets[0]).toMatchObject({ street: "Lindenstraße", notMet: 2, followUps: 0 });
    expect(JSON.stringify(result)).not.toMatch(/"4"|"6"|houseNumber/);
  });

  it("listet anstehende Termine mit Straße, ohne Hausnummer", () => {
    expect(getAppointments({ days: 7 }, ctx())).toEqual({ appointments: [{ date: "2026-10-26", time: "17:30", street: "Hauptstraße", type: null }] });
  });

  it("findet die Tür für einen Termin aus der Nachricht, sonst die zuletzt besuchte", () => {
    expect(findAppointmentHouse(ctx("Erinner mich morgen an die Hauptstr. 12"))?.id).toBe("c");
    expect(findAppointmentHouse(ctx("Erinner mich morgen um 18 Uhr"))?.id).toBe("d");
  });

  it("macht aus Speichern-Aufrufen Vorschläge und verrät Enes keine Adresse", async () => {
    const [call] = readToolCalls([{ id: "t", name: "schedule_appointment", args: { date: "2026-10-25", time: "18:00" } }]);
    const outcome = await runToolCalls(call ? [call] : [], ctx("Erinner mich morgen um 18 Uhr an die Hauptstraße 12"));
    expect(outcome.proposals).toHaveLength(1);
    expect(outcome.proposals[0]).toMatchObject({ detail: "Hauptstraße 12", state: "pending" });
    expect(outcome.results[0]?.content).not.toContain("Hauptstraße");
    expect(outcome.needsAnswer).toBe(false);
  });

  it("öffnet erlaubte Seiten und meldet verbotene", async () => {
    const calls = readToolCalls([{ id: "1", name: "open_page", args: { page: "crm" } }, { id: "2", name: "open_page", args: { page: "my-teams" } }]);
    const outcome = await runToolCalls(calls, ctx());
    expect(outcome.navigate?.href).toBe("/crm");
    expect(outcome.results[1]?.content).toContain("nicht verfügbar");
  });
});
