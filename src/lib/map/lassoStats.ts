import { formatArea, polygonAreaM2, selfIntersects, type LngLat } from "./lassoGeometry";
import { isPointInPolygon } from "./mapGeometry";

export interface LassoStats {
  area: string | null;
  houses: number;
  crosses: boolean;
}

/** Live-Zahlen fürs Panel: Fläche, wie viele Häuser (eigene und Team) drinliegen, kreuzen sich Kanten. */
export function lassoStats(points: LngLat[], housePositions: LngLat[]): LassoStats {
  if (points.length < 3) return { area: null, houses: 0, crosses: false };
  return {
    area: formatArea(polygonAreaM2(points)),
    houses: housePositions.filter((p) => isPointInPolygon(p, points)).length,
    crosses: selfIntersects(points),
  };
}
