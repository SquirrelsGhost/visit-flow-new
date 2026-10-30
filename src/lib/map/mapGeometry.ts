import type { GeofenceState, MapArea } from "./mapTypes";

export function isPointInPolygon(point: [number, number], polygonCoords: [number, number][]): boolean {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = polygonCoords.length - 1; i < polygonCoords.length; j = i++) {
    const xi = polygonCoords[i]![0];
    const yi = polygonCoords[i]![1];
    const xj = polygonCoords[j]![0];
    const yj = polygonCoords[j]![1];
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function doLineSegmentsIntersect(
  p1: [number, number],
  p2: [number, number],
  p3: [number, number],
  p4: [number, number],
): boolean {
  const ccw = (a: [number, number], b: [number, number], c: [number, number]) =>
    (c[1] - a[1]) * (b[0] - a[0]) > (b[1] - a[1]) * (c[0] - a[0]);
  return ccw(p1, p3, p4) !== ccw(p2, p3, p4) && ccw(p1, p2, p3) !== ccw(p1, p2, p4);
}

export function checkPolygonsOverlap(polyA: [number, number][][], polyB: [number, number][][]): boolean {
  const coordsA = polyA[0];
  const coordsB = polyB[0];
  if (!coordsA || !coordsB) return false;

  for (const pt of coordsA) {
    if (isPointInPolygon(pt, coordsB)) return true;
  }
  for (const pt of coordsB) {
    if (isPointInPolygon(pt, coordsA)) return true;
  }
  for (let i = 0; i < coordsA.length - 1; i++) {
    const a1 = coordsA[i]!;
    const a2 = coordsA[i + 1]!;
    for (let j = 0; j < coordsB.length - 1; j++) {
      if (doLineSegmentsIntersect(a1, a2, coordsB[j]!, coordsB[j + 1]!)) return true;
    }
  }
  return false;
}

export function evaluateGeofence(
  lng: number,
  lat: number,
  areas: MapArea[],
  currentUserId?: string,
): GeofenceState {
  if (areas.length === 0 || !currentUserId) return { status: "unknown" };
  let status: GeofenceState["status"] = "outside_all";
  let areaName = "";
  let managerName = "";

  for (const area of areas) {
    const coords = area.geojson.coordinates[0];
    if (!coords || coords.length === 0) continue;
    if (isPointInPolygon([lng, lat], coords)) {
      const isOwn = area.managerId === currentUserId;
      if (isOwn) {
        return { status: "inside_own", areaName: area.name };
      }
      status = "inside_other";
      areaName = area.name;
      managerName = area.managerName || "einem Kollegen";
    }
  }
  return { status, areaName, managerName };
}

export function getAreaBounds(area: MapArea): [[number, number], [number, number]] | null {
  const coords = area.geojson.coordinates[0];
  if (!coords || coords.length === 0) return null;
  let minLng = coords[0]![0];
  let maxLng = coords[0]![0];
  let minLat = coords[0]![1];
  let maxLat = coords[0]![1];

  for (const [lng, lat] of coords) {
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }
  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ];
}
