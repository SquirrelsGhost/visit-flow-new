import { describe, expect, it } from "vitest";
import { housesBounds } from "../lib/map/mapCamera";
import { isRecentEdit, mateColor, mergeDoorPoints } from "../lib/map/mapTeam";
import type { MapHouse } from "../lib/map/mapTypes";

describe("mergeDoorPoints", () => {
  it("fasst Türen eines Hauses zusammen, nimmt den besten Status und den letzten Bearbeiter", () => {
    const merged = mergeDoorPoints(
      [
        { id: "h1", lat: 50, lng: 10, status: "N/A", street: "Weg", houseNumber: 3, by: "Lena", ts: 1000 },
        { id: "h1", lat: 50, lng: 10, status: "Angetroffen → Termin", by: "Max", ts: 2000 },
      ],
      "me",
    );
    expect(merged).toHaveLength(1);
    expect(merged[0]).toMatchObject({ status: "Angetroffen → Termin", by: "Max", ts: 2000, number: "3" });
  });

  it("lässt eigene Türen und Punkte ohne Koordinaten weg", () => {
    const merged = mergeDoorPoints(
      [
        { id: "own", lat: 50, lng: 10, status: "N/A", userId: "me" },
        { id: "nogeo", status: "N/A", userId: "other" },
        { id: "team", lat: 50, lng: 10, status: "N/A", userId: "other" },
      ],
      "me",
    );
    expect(merged.map((m) => m.id)).toEqual(["team"]);
  });
});

describe("Team-Helfer", () => {
  it("gibt jedem Kollegen immer dieselbe Farbe", () => {
    expect(mateColor("u-lena")).toBe(mateColor("u-lena"));
  });

  it("erkennt Bearbeitungen der letzten 15 Minuten", () => {
    expect(isRecentEdit(Date.now() - 60_000)).toBe(true);
    expect(isRecentEdit(Date.now() - 20 * 60_000)).toBe(false);
    expect(isRecentEdit(0)).toBe(false);
  });
});

describe("housesBounds", () => {
  const house = (lng: number, lat: number) => ({ longitude: lng, latitude: lat }) as MapHouse;

  it("umschließt alle Häuser", () => {
    expect(housesBounds([house(10, 50), house(10.2, 50.1)])).toEqual([
      [10, 50],
      [10.2, 50.1],
    ]);
  });

  it("ist null ohne gültige Koordinaten", () => {
    expect(housesBounds([house(Number.NaN, 50)])).toBeNull();
  });
});
