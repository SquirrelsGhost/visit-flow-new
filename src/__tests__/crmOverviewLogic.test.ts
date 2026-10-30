import { describe, expect, it } from "vitest";
import { enrichSales, filterSales, groupByCustomer, overviewStats, rangeFor } from "../lib/crmOverview/overviewLogic";
import { ALL_USERS, type OverviewFilter } from "../lib/crmOverview/overviewTypes";

const doors = [
  { id: "d1", name: "Familie Krüger", street: "Lindenallee", houseNumber: "12", zipCode: "50667", city: "Köln" },
  { _id: "d2", name: "", street: "Wiesenstraße", houseNumber: "9", city: "Köln" },
  { id: "d3", name: "Richter, Lea", street: "", city: "Bonn" },
];
const products = [
  { id: "p1", doorId: "d1", userId: "u1", userName: "Lena", category: "Mobilfunk", type: "GigaMobil M", commissionEuro: 90, timestamp: "2026-10-24T09:00:00.000Z" },
  { id: "p2", doorId: "d1", userId: "u2", userName: "Deniz", category: "Festnetz", type: "GigaZuhause", commissionEuro: 140, timestamp: "2026-10-24T11:00:00.000Z", notes: "[STORNIERT] Widerruf" },
  { id: "p3", doorId: "d2", userId: "u1", userName: "Lena", category: "Strom", type: "Ökostrom", commissionEuro: 45, timestamp: "2026-10-01T09:00:00.000Z" },
  { id: "p4", doorId: "d3", userId: "u3", userName: "Marco", category: "Gas", type: "Gas Fix", commissionEuro: 40, timestamp: "2026-09-20T09:00:00.000Z", upsellGrade: 2, upsellDiff: 15 },
  { id: "p5", doorId: "missing", userId: "u3", userName: "Marco", category: "Mobilfunk", type: "GigaMobil L", commissionEuro: 120, timestamp: "2026-10-23T09:00:00.000Z" },
];
const sales = enrichSales(products, doors);
const base: OverviewFilter = { range: { id: "all", from: "", to: "" }, userId: ALL_USERS, onlyIssues: false, query: "", sort: "date" };

describe("CRM-Übersicht", () => {
  it("reichert Verkäufe mit Kunde und Adresse an und erkennt Probleme wie v1", () => {
    expect(sales[0]).toMatchObject({ customerName: "Familie Krüger", address: "Lindenallee 12, 50667 Köln", status: "open" });
    expect(sales[1]).toMatchObject({ status: "cancelled", note: "Widerruf" });
    expect(sales[2]).toMatchObject({ customerName: "Unbekannt", issue: "no_name" });
    expect(sales[3]).toMatchObject({ issue: "no_address", upsell: { grade: 2, diff: 15 } });
    expect(sales[4]).toMatchObject({ issue: "no_name" });
  });

  it("bündelt je Tür, nimmt Verkäufer vom jüngsten Verkauf und rechnet Stornos nicht ein", () => {
    const [first] = groupByCustomer(sales, "date");
    expect(first).toMatchObject({ doorId: "d1", userName: "Deniz", total: 90 });
    expect(first?.sales).toHaveLength(2);
    expect(groupByCustomer(sales, "commission")[0]?.doorId).toBe("missing");
    expect(groupByCustomer(sales, "name")[0]?.customerName).toBe("Familie Krüger");
  });

  it("filtert nach Zeitraum, Verkäufer, Problemen und Suche", () => {
    const today = new Date(2026, 9, 24, 15);
    expect(rangeFor("month", today)).toEqual({ id: "month", from: "2026-10-01", to: "2026-10-24" });
    expect(rangeFor("week", today).from).toBe("2026-10-17");
    expect(filterSales(sales, { ...base, range: rangeFor("month", today) }).map((s) => s.id)).toEqual(["p2", "p1", "p5", "p3"]);
    expect(filterSales(sales, { ...base, userId: "u3" })).toHaveLength(2);
    expect(filterSales(sales, { ...base, onlyIssues: true }).map((s) => s.id).sort()).toEqual(["p3", "p4", "p5"]);
    expect(filterSales(sales, { ...base, query: "linden" })).toHaveLength(2);
  });

  it("zählt Kennzahlen der gefilterten Verkäufe", () => {
    expect(overviewStats(sales)).toEqual({ sales: 5, customers: 4, issues: 3, stornos: 1, commission: 295, activeUsers: 3 });
  });
});
