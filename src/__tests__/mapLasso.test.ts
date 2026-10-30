import { describe, expect, it } from "vitest";
import { edgeMidpoints, formatArea, polygonAreaM2, selfIntersects, simplifyPath, type LngLat } from "../lib/map/lassoGeometry";
import { commit, emptyHistory, insertPoint, movePoint, redo, removePoint, undo } from "../lib/map/lassoHistory";
import { lassoStats } from "../lib/map/lassoStats";

// Etwa 100 m × 100 m am Kölner Dom
const SQUARE: LngLat[] = [
  [6.958, 50.941],
  [6.95942, 50.941],
  [6.95942, 50.9419],
  [6.958, 50.9419],
];

describe("Lasso-Geometrie", () => {
  it("rechnet die Fläche in m² und formatiert sie", () => {
    const area = polygonAreaM2(SQUARE);
    expect(area).toBeGreaterThan(9_000);
    expect(area).toBeLessThan(11_000);
    expect(formatArea(850)).toBe("850 m²");
    expect(formatArea(24_000)).toBe("2,4 ha");
    expect(formatArea(1_300_000)).toBe("1,3 km²");
  });

  it("legt Zwischenpunkte auf jede Kante, auch die schließende", () => {
    expect(edgeMidpoints(SQUARE)).toHaveLength(4);
    expect(edgeMidpoints(SQUARE.slice(0, 2))).toHaveLength(1);
    expect(edgeMidpoints(SQUARE)[3]).toEqual([6.958, (50.9419 + 50.941) / 2]);
  });

  it("erkennt eine Acht", () => {
    expect(selfIntersects(SQUARE)).toBe(false);
    expect(selfIntersects([SQUARE[0]!, SQUARE[2]!, SQUARE[1]!, SQUARE[3]!])).toBe(true);
  });

  it("macht aus einer Freihand-Linie wenige Eckpunkte", () => {
    const line = Array.from({ length: 50 }, (_, i) => ({ x: i * 4, y: i < 25 ? 0 : (i - 25) * 4 }));
    const simple = simplifyPath(line, 5);
    expect(simple.length).toBe(3);
    expect(simple[1]).toEqual({ x: 100, y: 0 });
  });

  it("zählt Häuser im Revier", () => {
    const stats = lassoStats(SQUARE, [[6.9587, 50.9414], [6.97, 50.95]]);
    expect(stats.houses).toBe(1);
    expect(stats.area).toMatch(/ha|m²/);
    expect(lassoStats(SQUARE.slice(0, 2), []).area).toBeNull();
  });
});

describe("Lasso-Verlauf", () => {
  it("macht Ziehen, Einfügen und Löschen rückgängig und wiederholt es", () => {
    let h = emptyHistory(SQUARE);
    h = commit(h, movePoint(h.present, 0, [6.9, 50.9]));
    h = commit(h, insertPoint(h.present, 0, [6.95, 50.95]));
    expect(h.present).toHaveLength(5);
    expect(h.present[1]).toEqual([6.95, 50.95]);
    h = commit(h, removePoint(h.present, 1));
    h = undo(h);
    expect(h.present).toHaveLength(5);
    h = undo(undo(h));
    expect(h.present).toEqual(SQUARE);
    h = redo(h);
    expect(h.present[0]).toEqual([6.9, 50.9]);
    expect(undo(emptyHistory())).toEqual(emptyHistory());
  });

  it("verwirft Wiederholen nach einer neuen Änderung", () => {
    let h = commit(emptyHistory(), [[1, 1]]);
    h = undo(h);
    h = commit(h, [[2, 2]]);
    expect(h.future).toHaveLength(0);
  });
});
