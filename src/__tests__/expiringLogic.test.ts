import { describe, expect, it } from "vitest";
import { cityOf, countBy, daysUntil, expiringStats, filterContracts, groupByUrgency, toContracts, urgencyOf } from "../lib/expiring/expiringLogic";
import { ALL, type ExpiringFilter } from "../lib/expiring/expiringTypes";

const now = new Date("2026-10-24T12:00:00.000Z");
const raws = [
  { id: "c1", category: "mobil", type: "GigaMobil M", userName: "Lena", daysUntilExpiry: 45, contractExpiryDate: "2026-12-08T12:00:00.000Z", customerName: "Weber, Anna", address: "Am Stadtpark 7a, 53111 Bonn", commissionEuro: 90, isLead: true },
  { id: "c2", category: "dsl", type: "DSL 100", userName: "Deniz", contractExpiryDate: "2026-11-03T12:00:00.000Z", customerName: "Bäckerei Sommer", address: "Hauptstraße 3, 50667 Köln", commissionEuro: 120, isLead: true, assignedAdvisor: "b1", assignedAdvisorName: "Lukas" },
  { id: "c3", category: "mobil", type: "GigaMobil L", userName: "Marco", daysUntilExpiry: 75, contractExpiryDate: "2027-01-07T12:00:00.000Z", customerName: "Autohaus Kaya", address: "Keine Adresse", commissionEuro: 200 },
  { id: "c4", category: "tv", userName: "", daysUntilExpiry: 29, contractExpiryDate: "2026-11-22T12:00:00.000Z", customerName: "", address: "Ringstraße 1, 40210 Düsseldorf", commissionEuro: 40, isLead: true },
];
const contracts = toContracts(raws, now);
const base: ExpiringFilter = { urgency: ALL, category: ALL, city: ALL, assign: "all", query: "", sort: "days" };

describe("Verträge vor Ablauf", () => {
  it("stuft die Dringlichkeit wie v1 ein (unter 30, unter 60, sonst niedrig)", () => {
    expect([0, 29, 30, 59, 60, 90].map(urgencyOf)).toEqual(["urgent", "urgent", "medium", "medium", "low", "low"]);
    expect(daysUntil("2026-11-03T12:00:00.000Z", now)).toBe(10);
  });

  it("übersetzt die v1-Antwort und rechnet fehlende Tage aus dem Ablaufdatum", () => {
    expect(contracts[0]).toMatchObject({ daysLeft: 45, urgency: "medium", city: "Bonn", isLead: true });
    expect(contracts[1]).toMatchObject({ daysLeft: 10, urgency: "urgent", advisorId: "b1", advisorName: "Lukas", city: "Köln" });
    expect(contracts[2]).toMatchObject({ address: "", city: "", urgency: "low" });
    expect(contracts[3]).toMatchObject({ customerName: "Unbekannt", userName: "Unbekannt", type: "tv" });
    expect(cityOf("Lindenallee 12, 50667 Köln")).toBe("Köln");
  });

  it("sortiert nach Restlaufzeit, Provision oder Name und bündelt nach Dringlichkeit", () => {
    expect(filterContracts(contracts, base).map((c) => c.id)).toEqual(["c2", "c4", "c1", "c3"]);
    expect(filterContracts(contracts, { ...base, sort: "commission" }).map((c) => c.id)).toEqual(["c3", "c2", "c1", "c4"]);
    expect(groupByUrgency(filterContracts(contracts, base)).map((g) => [g.urgency, g.contracts.length])).toEqual([["urgent", 2], ["medium", 1], ["low", 1]]);
  });

  it("filtert nach Suche, Dringlichkeit, Kategorie, Ort und Zuweisung", () => {
    expect(filterContracts(contracts, { ...base, query: "stadtpark" }).map((c) => c.id)).toEqual(["c1"]);
    expect(filterContracts(contracts, { ...base, urgency: "urgent" }).map((c) => c.id)).toEqual(["c2", "c4"]);
    expect(filterContracts(contracts, { ...base, category: "mobil" })).toHaveLength(2);
    expect(filterContracts(contracts, { ...base, city: "Köln" }).map((c) => c.id)).toEqual(["c2"]);
    expect(filterContracts(contracts, { ...base, assign: "assigned" }).map((c) => c.id)).toEqual(["c2"]);
    expect(filterContracts(contracts, { ...base, assign: "unassigned" }).map((c) => c.id)).toEqual(["c4", "c1"]);
  });

  it("zählt Provision, Durchschnitt, Potenzial und Top-Kategorie", () => {
    expect(expiringStats(contracts)).toEqual({
      count: 4,
      commission: 450,
      average: 112.5,
      potential: 130,
      byUrgency: { urgent: 2, medium: 1, low: 1 },
      topCategory: { category: "mobil", count: 2 },
    });
    expect(countBy(contracts, (c) => c.city)).toEqual([{ value: "Bonn", count: 1 }, { value: "Düsseldorf", count: 1 }, { value: "Köln", count: 1 }]);
  });
});
