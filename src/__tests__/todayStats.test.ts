import { describe, expect, it } from "vitest";
import type { MapHouse } from "../lib/map/mapTypes";
import { overviewTabsFor, structureLabelKey } from "../lib/overview/overviewTabs";
import { demoTodayHouses } from "../lib/overview/todayDemoData";
import { computeTodayStats } from "../lib/overview/todayStats";

const NOW = new Date(2026, 9, 23, 15, 0);
const at = (h: number) => new Date(2026, 9, 23, h, 0).toISOString();

const house = (id: string, doors: MapHouse["doors"], extra: Partial<MapHouse> = {}): MapHouse => ({
  id, street: "A", houseNumber: "1", zipCode: "1", city: "B", type: "MFH", latitude: 0, longitude: 0, status: "N/A", doors, ...extra,
});

describe("Tageszahlen der Übersicht", () => {
  it("zählt Türen von heute, Abschlüsse über Produkte und die Quoten wie v1", () => {
    const houses = [
      house("h1", [
        { id: "d1", name: "1", status: "Angetroffen → Sale", timestamp: at(10), products: [
          { id: "p1", category: "KIP", subCategory: "", type: "", quantity: 1, isPointRelevant: true, isPremium: false, vertical: "telco", timestamp: at(10) },
          { id: "p2", category: "GigaTV", subCategory: "", type: "", quantity: 1, isPointRelevant: true, isPremium: false, vertical: "telco", timestamp: at(10) },
        ] },
        { id: "d2", name: "2", status: "N/A", timestamp: at(11) },
        { id: "d3", name: "3", status: "Angetroffen → Termin", timestamp: at(12) },
        { id: "d4", name: "4", status: "Angetroffen → Kein Interesse", timestamp: new Date(2026, 9, 22, 12).toISOString() },
      ]),
      house("h2", [], { status: "Angetroffen → Versorgt", updatedAt: new Date(2026, 9, 23, 13).getTime() }),
      house("team", [{ id: "t1", name: "t", status: "N/A", timestamp: at(9) }], { isTeam: true }),
    ];
    const s = computeTodayStats(houses, "telco", NOW);
    expect(s).toMatchObject({ doors: 4, saleDoors: 1, products: 2, appointments: 1, supplied: 1, noInterest: 0, met: 3, notMet: 1, hitRate: 75, salesRate: 33 });
    expect(s.groups.find((g) => g.category === "KIP")?.count).toBe(1);
    expect(s.firstAt).toBe(new Date(at(10)).getTime());
    expect(computeTodayStats(houses, "energy", NOW).saleDoors).toBe(0);
  });

  it("liefert ohne Türen Nullen statt NaN", () => {
    expect(computeTodayStats([], "solar", NOW)).toMatchObject({ doors: 0, hitRate: 0, salesRate: 0, firstAt: undefined });
  });

  it("baut einen Beispieltag je Sparte", () => {
    const s = computeTodayStats(demoTodayHouses("energy", NOW), "energy", NOW);
    expect(s.doors).toBe(28);
    expect(s.saleDoors).toBe(5);
    expect(s.groups.map((g) => g.category)).toEqual(["Strom", "Gas"]);
  });
});

describe("Reiter der Übersicht", () => {
  it("richtet sich nach der Rolle wie v1", () => {
    expect(overviewTabsFor("berater", false)).toEqual(["today"]);
    expect(overviewTabsFor("teamleiter", true)).toEqual(["manage", "today", "contest"]);
    expect(overviewTabsFor("mentor", false)).toEqual(["structure", "today"]);
    expect(overviewTabsFor("admin", false)).toEqual(["team", "today"]);
    expect(structureLabelKey("mentor", true)).toBe("trainer");
    expect(structureLabelKey("strukturleiter", true)).toBe("structure");
  });
});
