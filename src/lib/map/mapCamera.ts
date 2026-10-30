import type { Map as MapboxMap, PointLike } from "mapbox-gl";
import type { MapHouse } from "./mapTypes";
import { TEAM_HOUSES_LAYER } from "./mapTeamLayer";

const CLICKABLE_LAYERS = ["houses-circle", TEAM_HOUSES_LAYER];

/** Rahmen um alle Häuser oder null, wenn keins gültige Koordinaten hat. */
export function housesBounds(houses: MapHouse[]): [[number, number], [number, number]] | null {
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;
  for (const h of houses) {
    if (!Number.isFinite(h.longitude) || !Number.isFinite(h.latitude)) continue;
    minLng = Math.min(minLng, h.longitude);
    minLat = Math.min(minLat, h.latitude);
    maxLng = Math.max(maxLng, h.longitude);
    maxLat = Math.max(maxLat, h.latitude);
  }
  if (!Number.isFinite(minLng)) return null;
  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ];
}

/** Weicher Zoom auf die eigenen Häuser (v1: padding 60, maxZoom 16). Gibt zurück, ob gezoomt wurde. */
export function fitToHouses(map: MapboxMap, houses: MapHouse[]): boolean {
  const bounds = housesBounds(houses);
  if (!bounds) return false;
  try {
    map.fitBounds(bounds, { padding: 60, maxZoom: 16, duration: 900 });
    return true;
  } catch {
    return false;
  }
}

/** Zeiger-Hand über antippbaren Häusern (v1: mouseenter/mouseleave auf houses-circle). */
export function updateMapCursor(map: MapboxMap, point: PointLike): void {
  const layers = CLICKABLE_LAYERS.filter((id) => map.getLayer(id));
  const hit = layers.length > 0 && map.queryRenderedFeatures(point, { layers }).length > 0;
  map.getCanvas().style.cursor = hit ? "pointer" : "";
}
