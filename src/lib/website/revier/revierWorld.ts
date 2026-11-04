import { AREAS, HOUSES, ROUTE, STREET_PATH, TEAM, type DoorStatus } from "./revierData";

/**
 * Übersetzt das 2D-Revier der alten Website (1000 × 796 Punkte) in die 3D-Welt:
 * x nach rechts, z nach vorn, 10 Punkte = 1 Einheit, Mitte des Viertels im Ursprung.
 */
export type Vec2 = [number, number];

const SCALE = 10;
const CX = 500;
const CY = 400;

export function toWorld([x, y]: readonly [number, number]): Vec2 {
  return [(x - CX) / SCALE, (y - CY) / SCALE];
}

/** Gleichbleibender Zufall je Haus, damit das Viertel bei jedem Besuch gleich aussieht. */
function seeded(i: number): number {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

export interface HouseShape {
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  rot: number;
}

export const HOUSE_SHAPES: HouseShape[] = HOUSES.map((p, i) => {
  const [x, z] = toWorld(p);
  const tall = seeded(i + 7) > 0.82;
  return {
    x,
    z,
    w: 1.1 + seeded(i) * 0.7,
    d: 1.1 + seeded(i + 3) * 0.7,
    h: tall ? 3.2 + seeded(i + 5) * 2.4 : 1 + seeded(i + 5) * 1.3,
    rot: (seeded(i + 11) - 0.5) * 0.5,
  };
});

export const housePos = (house: number): Vec2 => {
  const shape = HOUSE_SHAPES[house];
  return shape ? [shape.x, shape.z] : [0, 0];
};

/** Straßen als Liniensegmente [x1, z1, x2, z2]. */
export const STREET_SEGMENTS: [number, number, number, number][] = STREET_PATH.split("M")
  .filter(Boolean)
  .map((part) => {
    const [a, b] = part.split("L");
    const [x1, y1] = (a ?? "0 0").trim().split(" ").map(Number);
    const [x2, y2] = (b ?? "0 0").trim().split(" ").map(Number);
    const [wx1, wz1] = toWorld([x1 ?? 0, y1 ?? 0]);
    const [wx2, wz2] = toWorld([x2 ?? 0, y2 ?? 0]);
    return [wx1, wz1, wx2, wz2];
  });

export const AREA_SHAPES = AREAS.map((area) => ({
  name: area.name,
  own: area.own,
  points: area.points.split(" ").map((pair) => toWorld(pair.split(",").map(Number) as [number, number])),
}));

/** Laufweg von Tür zu Tür mit aufsummierter Länge, damit der Läufer gleichmäßig geht. */
const ROUTE_POINTS = ROUTE.map(([house]) => housePos(house));
const ROUTE_AT: number[] = [0];
for (let i = 1; i < ROUTE_POINTS.length; i++) {
  const [x, z] = ROUTE_POINTS[i] ?? [0, 0];
  const [px, pz] = ROUTE_POINTS[i - 1] ?? [0, 0];
  ROUTE_AT.push((ROUTE_AT[i - 1] ?? 0) + Math.hypot(x - px, z - pz));
}
const ROUTE_TOTAL = ROUTE_AT[ROUTE_AT.length - 1] ?? 1;

/** Position auf dem Laufweg bei Fortschritt w (0 bis 1) und die Zahl der schon besuchten Türen. */
export function walkAt(w: number): { pos: Vec2; visited: number } {
  const target = Math.min(Math.max(w, 0), 1) * ROUTE_TOTAL;
  let i = 1;
  while (i < ROUTE_AT.length - 1 && (ROUTE_AT[i] ?? 0) < target) i++;
  const a = ROUTE_POINTS[i - 1] ?? [0, 0];
  const b = ROUTE_POINTS[i] ?? a;
  const from = ROUTE_AT[i - 1] ?? 0;
  const span = (ROUTE_AT[i] ?? from) - from || 1;
  const k = Math.min(Math.max((target - from) / span, 0), 1);
  const visited = w >= 1 ? ROUTE.length : k > 0.85 ? i + 1 : i;
  return { pos: [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k], visited };
}

/** Mittelpunkt des Laufwegs: dort schaut die Kamera beim Rundgang hin. */
export const ROUTE_CENTER: Vec2 = [
  ROUTE_POINTS.reduce((s, [x]) => s + x, 0) / ROUTE_POINTS.length,
  ROUTE_POINTS.reduce((s, [, z]) => s + z, 0) / ROUTE_POINTS.length,
];

export const TEAM_WORLD = TEAM.map((member) => ({ ...member, at: toWorld(member.at) }));

export const STATUS_COLOR: Record<DoorStatus, string> = {
  na: "#9aa6b8",
  no: "#ef4444",
  termin: "#3b82f6",
  sale: "#22c55e",
  versorgt: "#06b6d4",
};
