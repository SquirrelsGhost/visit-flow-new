import { describe, expect, it } from "vitest";
import { checkPolygonsOverlap, evaluateGeofence, getAreaBounds, isPointInPolygon } from "../lib/map/mapGeometry";
import { bestStatus, colorForStatus, statusLabel, type MapArea } from "../lib/map/mapTypes";

const SAMPLE_AREA: MapArea = {
  id: "a1",
  name: "Revier Mitte",
  managerId: "u1",
  managerName: "Max",
  geojson: {
    type: "Polygon",
    coordinates: [
      [
        [10.0, 50.0],
        [10.2, 50.0],
        [10.2, 50.2],
        [10.0, 50.2],
        [10.0, 50.0],
      ],
    ],
  },
};

describe("Karten-Logik aus v1 (TrackingMap)", () => {
  it("liefert Farben, Labels (inkl. Solar Unpassend) und höchste Status-Priorität", () => {
    expect(colorForStatus("Angetroffen → Sale")).toBe("#22c55e");
    expect(colorForStatus("offen")).toBe("#64748b");
    expect(statusLabel("Angetroffen → Versorgt", "telco")).toBe("Versorgt");
    expect(statusLabel("Angetroffen → Versorgt", "solar")).toBe("Unpassend");
    expect(bestStatus(["N/A", "Angetroffen → Kein Interesse", "Angetroffen → Sale"])).toBe("Angetroffen → Sale");
  });

  it("prüft Punkt-in-Polygon, Gebiets-Überschneidung, Bounds und Geofence", () => {
    const ring = SAMPLE_AREA.geojson.coordinates[0]!;
    expect(isPointInPolygon([10.1, 50.1], ring)).toBe(true);
    expect(isPointInPolygon([11.0, 50.1], ring)).toBe(false);

    expect(evaluateGeofence(10.1, 50.1, [SAMPLE_AREA], "u1").status).toBe("inside_own");
    expect(evaluateGeofence(10.1, 50.1, [SAMPLE_AREA], "u2").status).toBe("inside_other");
    expect(evaluateGeofence(11.0, 50.1, [SAMPLE_AREA], "u1").status).toBe("outside_all");

    expect(getAreaBounds(SAMPLE_AREA)).toEqual([
      [10.0, 50.0],
      [10.2, 50.2],
    ]);
    expect(checkPolygonsOverlap(SAMPLE_AREA.geojson.coordinates, SAMPLE_AREA.geojson.coordinates)).toBe(true);
  });
});
