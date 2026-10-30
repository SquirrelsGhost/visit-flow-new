import type { GeoJSONSource, Map as MapboxMap } from "mapbox-gl";
import type { Theme } from "../theme/themeContext";
import { colorForStatus, type MapArea, type MapHouse } from "./mapTypes";

function styleReady(map: MapboxMap | null): map is MapboxMap {
  try {
    return Boolean(map && map.isStyleLoaded());
  } catch {
    return false;
  }
}

export function buildHousesGeoJSON(houses: MapHouse[]) {
  return {
    type: "FeatureCollection" as const,
    features: houses.map((h) => ({
      type: "Feature" as const,
      id: h.id,
      geometry: { type: "Point" as const, coordinates: [h.longitude, h.latitude] },
      properties: {
        houseId: h.id,
        number: h.houseNumber,
        type: h.type,
        status: h.status,
        color: colorForStatus(h.status),
        isTeam: h.isTeam ? 1 : 0,
      },
    })),
  };
}

export function buildAreasGeoJSON(areas: MapArea[], currentUserId?: string) {
  return {
    type: "FeatureCollection" as const,
    features: areas.map((area) => {
      const isOwn = currentUserId && area.managerId === currentUserId ? 1 : 0;
      const displayName = isOwn ? `${area.name} (Eigene)` : `${area.name} (${area.managerName || "Kollege"})`;
      return {
        type: "Feature" as const,
        properties: { id: area.id, name: displayName, description: area.description ?? "", isOwn },
        geometry: area.geojson,
      };
    }),
  };
}

export function syncMapOverlays(
  map: MapboxMap | null,
  houses: MapHouse[],
  areas: MapArea[],
  currentUserId: string | undefined,
  is3D: boolean,
  theme: Theme,
): void {
  if (!styleReady(map)) return;

  const areasData = buildAreasGeoJSON(areas, currentUserId);
  const existingAreasSrc = map.getSource("existing-areas-source") as GeoJSONSource | undefined;
  if (existingAreasSrc) {
    existingAreasSrc.setData(areasData);
  } else {
    map.addSource("existing-areas-source", { type: "geojson", data: areasData });
    map.addLayer({
      id: "existing-areas-fill",
      type: "fill",
      source: "existing-areas-source",
      paint: {
        "fill-color": ["case", ["==", ["get", "isOwn"], 1], "#10b981", "#ef4444"],
        "fill-opacity": 0.08,
      },
    });
    map.addLayer({
      id: "existing-areas-outline",
      type: "line",
      source: "existing-areas-source",
      paint: {
        "line-color": ["case", ["==", ["get", "isOwn"], 1], "#10b981", "#ef4444"],
        "line-width": ["case", ["==", ["get", "isOwn"], 1], 2.5, 1.8],
        "line-dasharray": [3, 3],
      },
    });
    map.addLayer({
      id: "existing-areas-labels",
      type: "symbol",
      source: "existing-areas-source",
      layout: {
        "text-field": ["get", "name"],
        "text-size": 11,
        "text-offset": [0, 0],
        "text-anchor": "center",
      },
      paint: {
        "text-color": ["case", ["==", ["get", "isOwn"], 1], "#059669", "#dc2626"],
        "text-halo-color": "#ffffff",
        "text-halo-width": 1.5,
      },
    });
  }

  const housesData = buildHousesGeoJSON(houses);
  const housesSrc = map.getSource("houses") as GeoJSONSource | undefined;
  if (housesSrc) {
    housesSrc.setData(housesData);
  } else {
    map.addSource("houses", { type: "geojson", data: housesData });
    map.addLayer({
      id: "houses-circle",
      type: "circle",
      source: "houses",
      paint: {
        "circle-color": ["get", "color"],
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 12, 5, 15, 9, 18, 16],
        "circle-stroke-width": ["interpolate", ["linear"], ["zoom"], 12, 1.5, 16, 3],
        "circle-stroke-color": "#ffffff",
        "circle-opacity": 1,
      },
    });
    map.addLayer({
      id: "houses-num",
      type: "symbol",
      source: "houses",
      minzoom: 16,
      layout: {
        "text-field": ["get", "number"],
        "text-size": 11,
        "text-offset": [0, -1.3],
        "text-allow-overlap": false,
      },
      paint: {
        "text-color": "#ffffff",
        "text-halo-color": "#0b1220",
        "text-halo-width": 2.2,
      },
    });
  }

  if (is3D) {
    if (!map.getLayer("building-3d")) {
      try {
        map.addLayer(
          {
            id: "building-3d",
            type: "fill-extrusion",
            source: "composite",
            "source-layer": "building",
            minzoom: 14,
            filter: ["==", ["get", "extrude"], "true"],
            paint: {
              "fill-extrusion-color": theme === "dark" ? "#3a4658" : "#c8d0dc",
              "fill-extrusion-height": ["get", "height"],
              "fill-extrusion-base": ["get", "min_height"],
              "fill-extrusion-opacity": 0.6,
            },
          },
          map.getLayer("houses-circle") ? "houses-circle" : undefined,
        );
      } catch {
        // Stil unterstützt keine 3D-Gebäude
      }
    }
  } else if (map.getLayer("building-3d")) {
    map.removeLayer("building-3d");
  }
}
