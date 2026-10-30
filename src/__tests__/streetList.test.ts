import { describe, expect, it } from "vitest";
import type { TeamUser } from "../lib/overview/teamTypes";
import { computeActivity, isoWeek, periodFilter } from "../lib/streets/streetActivity";
import { buildStreetRows, groupByPlace, housesOf, rowsOfPeople, searchRows, streetStats } from "../lib/streets/streetGrouping";
import { strukturMemberIds } from "../lib/streets/streetPeople";
import { buildReportText } from "../lib/streets/streetReport";
import { normalizeStatus } from "../lib/streets/streetStatus";
import type { RawDoor, RawProduct } from "../lib/streets/streetTypes";

const door = (id: string, street: string, houseNumber: string, status: string, userId: string, extra: Partial<RawDoor> = {}): RawDoor => ({
  id,
  street,
  houseNumber,
  zipCode: "40210",
  city: "Düsseldorf",
  status,
  userId,
  customerName: "",
  timestamp: "2026-10-23T09:00:00",
  ...extra,
});
const sale = (doorId: string, userId: string, category: string, commissionEuro = 0): RawProduct => ({ doorId, userId, category, quantity: 1, timestamp: "2026-10-23T09:00:00", commissionEuro });
const names = new Map([
  ["a", "Anna Berg"],
  ["b", "Ben Kraus"],
]);

describe("Straßenliste", () => {
  it("bildet v1-Status auf die kurze Anzeige ab", () => {
    expect(normalizeStatus("Angetroffen → Sale")).toBe("sale");
    expect(normalizeStatus("Angetroffen → Kein Interesse")).toBe("kein");
    expect(normalizeStatus("N/A")).toBe("na");
  });

  it("bündelt Türen je Straße, zählt Verkäufe und lässt Türen ohne Hausnummer weg", () => {
    const rows = buildStreetRows(
      {
        doors: [door("1", "Oststraße", "10", "Angetroffen → Sale", "a"), door("2", "oststraße", "2", "N/A", "b"), door("3", "Oststraße", "", "N/A", "a"), door("4", "Nordstraße", "1", "N/A", "a", { zipCode: "40477" })],
        products: [sale("1", "a", "KIP"), sale("1", "a", "KIP")],
      },
      (id) => names.get(id),
      "?",
    );
    expect(rows.map((r) => r.street)).toEqual(["Oststraße", "Nordstraße"]);
    const ost = rows[0]!;
    expect(ost.doors.map((d) => d.houseNumber)).toEqual(["2", "10"]);
    expect(ost.sales).toBe(1);
    expect(ost.doors[1]!.products).toEqual([{ category: "KIP", quantity: 2 }]);
    expect(groupByPlace(rows).map((p) => p.key)).toEqual(["40210 Düsseldorf", "40477 Düsseldorf"]);
    expect(streetStats(rows)).toMatchObject({ doors: 3, sales: 1, places: 2 });
    expect(searchRows(rows, "ben")[0]!.doors).toHaveLength(1);
    expect(rowsOfPeople(rows, new Set(["b"]))).toHaveLength(1);
  });

  it("erkennt Mehrfamilienhäuser und schreibt den Bericht wie v1", () => {
    const rows = buildStreetRows({ doors: [door("1", "Oststraße", "5", "N/A", "a"), door("2", "Oststraße", "5", "Angetroffen → Termin", "a")], products: [] }, (id) => names.get(id), "?");
    expect(housesOf(rows[0]!)[0]!.doors).toHaveLength(2);
    expect(buildReportText(rows, { mode: "day", from: "2026-10-23", to: "2026-10-23" })).toContain("Datum: 23.10.2026");
  });

  it("findet die Struktur eines Strukturleiters wie v1 (direkt plus Berater der Mentoren)", () => {
    const users = [
      { id: "m", role: "mentor", strukturleiterId: "s" },
      { id: "x", role: "berater", mentorId: "m" },
      { id: "y", role: "berater", strukturleiterId: "s" },
      { id: "z", role: "berater" },
    ] as TeamUser[];
    expect(strukturMemberIds(users, "s", false).sort()).toEqual(["m", "x", "y"]);
  });

  it("rechnet Aktivität je Person und Woche", () => {
    expect(periodFilter("week", new Date(2026, 9, 23))).toEqual({ mode: "range", from: "2026-10-19", to: "2026-10-25" });
    expect(isoWeek(new Date(2026, 9, 23))).toEqual({ week: 43, year: 2026 });
    const people = [
      { id: "a", name: "Anna", role: "berater" },
      { id: "b", name: "Ben", role: "berater" },
    ];
    const doors = [door("1", "Oststraße", "1", "N/A", "a"), door("2", "Oststraße", "2", "N/A", "a", { timestamp: "2026-10-21T10:00:00" })];
    const [first, second] = computeActivity(people, doors, [sale("1", "a", "KIP", 60)], { mode: "range", from: "2026-10-19", to: "2026-10-25" });
    expect(first).toMatchObject({ days: 2, doors: 2, sales: 1, revenue: 60, breakdown: [{ short: "KIP", count: 1 }] });
    expect(second).toMatchObject({ days: 0, doors: 0 });
  });
});
