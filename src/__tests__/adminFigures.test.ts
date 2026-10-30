import { describe, expect, it } from "vitest";
import { adminFigures, loadStart, TREND_DAYS } from "../lib/admin/adminFigures";
import { adminTeamSummary } from "../lib/admin/adminTeam";
import type { AdminActivity, AdminProduct } from "../lib/admin/adminTypes";
import type { OrgDirectory } from "../lib/teams/orgTypes";

const NOW = new Date("2026-10-23T15:00:00");
const at = (day: string, hour = 11) => new Date(`${day}T${String(hour).padStart(2, "0")}:00:00`).toISOString();
const sale = (userId: string, day: string, category = "KIP", notes?: string, doorId = `${userId}-${day}`): AdminProduct => ({ doorId, userId, category, type: category, timestamp: at(day), commissionEuro: 100, notes });

const directory: OrgDirectory = {
  teams: [
    { id: "t1", name: "Team Nord" },
    { id: "t2", name: "Team Süd" },
  ],
  users: [
    { id: "a", name: "Anna", role: "teamleiter", teamId: "t1", isActive: true, createdAt: "2026-10-02T08:00:00Z" },
    { id: "b", name: "Ben", role: "berater", teamId: "t1", isActive: true },
    { id: "c", name: "Cem", role: "berater", teamId: "t2", isActive: true, isBlocked: true },
    { id: "d", name: "Dana", role: "berater", isActive: true, dailyStatus: "sick", dailyStatusStartDate: "2026-10-23T00:00:00", dailyStatusEndDate: "2026-10-24T23:59:00" },
  ],
};

const activity: AdminActivity = {
  products: [
    sale("a", "2026-10-23"),
    sale("a", "2026-10-23", "Mobile"),
    sale("b", "2026-10-22"),
    sale("b", "2026-10-20", "KIP", "[STORNIERT]"),
    sale("c", "2026-10-05", "KIP", "[ABGESCHLOSSEN]"),
    sale("b", "2026-10-21", "Strom"),
    sale("a", "2026-09-30"),
  ],
  doors: [
    { userId: "a", timestamp: at("2026-10-23", 9), status: "N/A" },
    { userId: "a", timestamp: at("2026-10-23", 10), status: "N/A" },
    { userId: "b", timestamp: at("2026-10-23", 10), status: "N/A" },
    { userId: "b", timestamp: at("2026-10-23", 12), status: "N/A" },
  ],
};

describe("Admin-Dashboard", () => {
  it("lädt ab dem früheren von Monatsanfang und Verlaufsbeginn", () => {
    expect(loadStart(NOW).getDate()).toBe(1);
    expect(loadStart(new Date("2026-10-05T12:00:00")).getMonth()).toBe(8);
  });

  it("zählt heute, gestern, Quote und Aktive in der Sparte", () => {
    const f = adminFigures(directory, activity, "telco", NOW);
    expect(f.salesToday).toBe(2);
    expect(f.salesYesterday).toBe(1);
    expect(f.doorsToday).toBe(4);
    expect(f.conversion).toBe(50);
    expect(f.activeToday).toBe(2);
    expect(f.days).toHaveLength(TREND_DAYS);
    expect(f.days.at(-1)).toEqual({ date: "2026-10-23", sales: 2, doors: 4 });
  });

  it("rechnet die Stornoquote je Auftrag wie die Seite Aufträge", () => {
    const { month } = adminFigures(directory, activity, "telco", NOW);
    // Okt.: a am 23. (ein Auftrag, zwei Produkte), b am 22., b am 20. storniert, c am 5. abgeschlossen
    expect(month.sales).toBe(3);
    expect(month.stornos).toBe(1);
    expect(month.completed).toBe(1);
    expect(month.quote).toBe(25);
  });

  it("vergleicht Sparten und reiht Teams nach dem Monat", () => {
    const f = adminFigures(directory, activity, "telco", NOW);
    expect(f.byVertical).toEqual({ telco: 4, energy: 1, solar: 0 });
    expect(f.teams.map((t) => [t.name, t.salesMonth, t.salesToday, t.people])).toEqual([
      ["Team Nord", 3, 2, 2],
      ["Team Süd", 1, 0, 0],
    ]);
  });

  it("fasst Personen über alle Teams zusammen", () => {
    expect(adminTeamSummary(directory, NOW)).toEqual({ people: 3, teams: 2, leads: 1, working: 2, out: 1, blocked: 1, unassigned: 1, newThisMonth: 1 });
  });
});
