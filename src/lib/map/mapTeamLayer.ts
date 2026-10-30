import type { GeoJSONSource, Map as MapboxMap } from "mapbox-gl";
import { buildTeamHousesGeoJSON, type TeamHouse } from "./mapTeam";

export const TEAM_HOUSES_LAYER = "team-houses-circle";
const TEAM_HOUSES_SOURCE = "team-houses";

/** Team-Häuser als eigene Ebene unter den eigenen Markern (v1: Ring nach Status, leicht transparent). */
export function syncTeamHousesLayer(map: MapboxMap | null, houses: TeamHouse[]): void {
  try {
    if (!map || !map.isStyleLoaded()) return;
  } catch {
    return;
  }
  const data = buildTeamHousesGeoJSON(houses);
  const source = map.getSource(TEAM_HOUSES_SOURCE) as GeoJSONSource | undefined;
  if (source) {
    source.setData(data);
    return;
  }
  map.addSource(TEAM_HOUSES_SOURCE, { type: "geojson", data });
  map.addLayer(
    {
      id: TEAM_HOUSES_LAYER,
      type: "circle",
      source: TEAM_HOUSES_SOURCE,
      paint: {
        "circle-color": ["get", "color"],
        "circle-opacity": 0.55,
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 12, 4, 15, 8, 18, 14],
        "circle-stroke-width": ["interpolate", ["linear"], ["zoom"], 12, 1.5, 16, 2.5],
        "circle-stroke-color": "#ffffff",
        "circle-stroke-opacity": 0.9,
      },
    },
    map.getLayer("houses-circle") ? "houses-circle" : undefined,
  );
}
