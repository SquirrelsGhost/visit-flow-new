import type { GeoJSONSource, Map as MapboxMap } from "mapbox-gl";
import type { LngLat } from "./lassoGeometry";

const SOURCE = "tracking-lasso-source";
const GUIDE_SOURCE = "tracking-lasso-guide-source";
const FILL = "tracking-lasso-fill";
const GLOW = "tracking-lasso-glow";
const LINE = "tracking-lasso-line";
const GUIDE = "tracking-lasso-guide";
const COLOR = "#8b5cf6";
const pending = new WeakMap<MapboxMap, LngLat[]>();

function ready(map: MapboxMap): boolean {
  try {
    return map.isStyleLoaded();
  } catch {
    return false;
  }
}

function shape(points: LngLat[]) {
  const closed = points.length > 2;
  return {
    type: "Feature" as const,
    properties: {},
    geometry: closed
      ? { type: "Polygon" as const, coordinates: [[...points, points[0]!]] }
      : { type: "LineString" as const, coordinates: points.length === 1 ? [points[0]!, points[0]!] : points },
  };
}

function ensureLayers(map: MapboxMap): void {
  if (map.getSource(SOURCE)) return;
  const empty = { type: "FeatureCollection" as const, features: [] };
  map.addSource(SOURCE, { type: "geojson", data: empty });
  map.addSource(GUIDE_SOURCE, { type: "geojson", data: empty });
  map.addLayer({ id: FILL, type: "fill", source: SOURCE, filter: ["==", "$type", "Polygon"], paint: { "fill-color": COLOR, "fill-opacity": 0.16 } });
  map.addLayer({ id: GLOW, type: "line", source: SOURCE, paint: { "line-color": COLOR, "line-width": 10, "line-opacity": 0.25, "line-blur": 6 } });
  map.addLayer({
    id: LINE,
    type: "line",
    source: SOURCE,
    layout: { "line-join": "round", "line-cap": "round" },
    paint: { "line-color": "#ffffff", "line-width": 2.5, "line-opacity": 0.95 },
  });
  map.addLayer({
    id: GUIDE,
    type: "line",
    source: GUIDE_SOURCE,
    layout: { "line-cap": "round" },
    paint: { "line-color": "#ffffff", "line-width": 2, "line-opacity": 0.8, "line-dasharray": [1.5, 2] },
  });
}

/**
 * Lasso auf der Karte: weiche Fläche, leuchtender Rand, weiße Linie (wie v1, nur edler).
 * Die Eckpunkte sind eigene Marker zum Ziehen (useLassoHandles), deshalb hier keine Punkt-Ebene.
 */
export function syncLassoOverlay(map: MapboxMap | null, points: LngLat[]): void {
  if (!map) return;
  // Vorhandene Quelle direkt aktualisieren: isStyleLoaded() ist false, solange irgendeine Quelle lädt
  const existing = map.getSource(SOURCE) as GeoJSONSource | undefined;
  if (existing && points.length > 0) return void existing.setData(shape(points));
  if (!ready(map)) {
    // Nur den neuesten Stand nachholen, sobald die Karte bereit ist
    const waiting = pending.has(map);
    pending.set(map, points);
    if (!waiting) {
      map.once("idle", () => {
        const latest = pending.get(map) ?? [];
        pending.delete(map);
        syncLassoOverlay(map, latest);
      });
    }
    return;
  }
  pending.delete(map);
  if (points.length === 0) {
    for (const id of [GUIDE, LINE, GLOW, FILL]) if (map.getLayer(id)) map.removeLayer(id);
    for (const id of [GUIDE_SOURCE, SOURCE]) if (map.getSource(id)) map.removeSource(id);
    return;
  }
  ensureLayers(map);
  (map.getSource(SOURCE) as GeoJSONSource).setData(shape(points));
}

/** Gestrichelte Vorschau vom letzten Punkt zum Mauszeiger (und zurück zum ersten). */
export function syncLassoGuide(map: MapboxMap | null, points: LngLat[], cursor: LngLat | null): void {
  if (!map) return;
  const source = map.getSource(GUIDE_SOURCE) as GeoJSONSource | undefined;
  if (!source) return;
  const last = points.at(-1);
  const coords = cursor && last ? (points.length > 1 ? [last, cursor, points[0]!] : [last, cursor]) : [];
  source.setData({
    type: "Feature",
    properties: {},
    geometry: { type: "LineString", coordinates: coords },
  });
}
