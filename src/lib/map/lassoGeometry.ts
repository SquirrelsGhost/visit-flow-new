export type LngLat = [number, number];

const EARTH_RADIUS = 6_371_008.8;
const rad = (d: number) => (d * Math.PI) / 180;

/** Fläche des Lasso-Rings in m² (sphärische Näherung, für Reviergrößen auf wenige Prozent genau). */
export function polygonAreaM2(points: LngLat[]): number {
  if (points.length < 3) return 0;
  let sum = 0;
  for (let i = 0; i < points.length; i++) {
    const [lng1, lat1] = points[i]!;
    const [lng2, lat2] = points[(i + 1) % points.length]!;
    sum += rad(lng2 - lng1) * (2 + Math.sin(rad(lat1)) + Math.sin(rad(lat2)));
  }
  return Math.abs((sum * EARTH_RADIUS * EARTH_RADIUS) / 2);
}

/** "850 m²", "2,4 ha" oder "1,3 km²". */
export function formatArea(m2: number): string {
  const de = (n: number, digits: number) => n.toLocaleString("de-DE", { maximumFractionDigits: digits });
  if (m2 < 10_000) return `${de(Math.round(m2), 0)} m²`;
  if (m2 < 1_000_000) return `${de(m2 / 10_000, 1)} ha`;
  return `${de(m2 / 1_000_000, 2)} km²`;
}

/** Mitte jeder Kante, auch der schließenden, damit man dort einen neuen Punkt herausziehen kann. */
export function edgeMidpoints(points: LngLat[]): LngLat[] {
  if (points.length < 2) return [];
  const edges = points.length > 2 ? points.length : 1;
  return Array.from({ length: edges }, (_, i) => {
    const [a, b] = [points[i]!, points[(i + 1) % points.length]!];
    return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] as LngLat;
  });
}

function segmentsCross(p1: LngLat, p2: LngLat, p3: LngLat, p4: LngLat): boolean {
  const d = (a: LngLat, b: LngLat, c: LngLat) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  const d1 = d(p3, p4, p1);
  const d2 = d(p3, p4, p2);
  const d3 = d(p1, p2, p3);
  const d4 = d(p1, p2, p4);
  return d1 * d2 < 0 && d3 * d4 < 0;
}

/** Kreuzen sich Kanten? Dann ist das Revier eine "Acht" und zählt Häuser falsch. */
export function selfIntersects(points: LngLat[]): boolean {
  const n = points.length;
  if (n < 4) return false;
  for (let i = 0; i < n; i++) {
    for (let j = i + 2; j < n; j++) {
      if (i === 0 && j === n - 1) continue;
      if (segmentsCross(points[i]!, points[(i + 1) % n]!, points[j]!, points[(j + 1) % n]!)) return true;
    }
  }
  return false;
}

type XY = { x: number; y: number };

function distToSegment(p: XY, a: XY, b: XY): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = dx * dx + dy * dy;
  const t = len === 0 ? 0 : Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

/** Douglas-Peucker in Bildschirm-Pixeln: aus einer Freihand-Linie werden wenige, gut greifbare Punkte. */
export function simplifyPath<T extends XY>(points: T[], tolerance: number): T[] {
  if (points.length < 3) return points;
  let maxDist = 0;
  let index = 0;
  const first = points[0]!;
  const last = points[points.length - 1]!;
  for (let i = 1; i < points.length - 1; i++) {
    const dist = distToSegment(points[i]!, first, last);
    if (dist > maxDist) {
      maxDist = dist;
      index = i;
    }
  }
  if (maxDist <= tolerance) return [first, last];
  return [...simplifyPath(points.slice(0, index + 1), tolerance).slice(0, -1), ...simplifyPath(points.slice(index), tolerance)];
}
