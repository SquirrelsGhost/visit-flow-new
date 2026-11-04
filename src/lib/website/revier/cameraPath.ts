import { ease, mix, PHASE, within } from "./journeyTimeline";
import { ROUTE_CENTER, walkAt, type Vec2 } from "./revierWorld";

/** Kamerafahrt: von oben auf den Kompass, hinab ins Viertel, dem Läufer nach, hoch über das Team, raus zum Auto, rundherum, zurück nach oben. */
export interface Pose {
  pos: [number, number, number];
  look: [number, number, number];
}

const TOP: Pose = { pos: [0, 195, 26.01], look: [0, 0, 26] };
const OVERVIEW: Pose = { pos: [8, 62, 70], look: [0, 0, 4] };
const DRIVE: Pose = { pos: [70, 34, 78], look: [26, 0, 16] };
const SHIELD: Pose = { pos: [62, 58, 88], look: [0, 8, 0] };

/** Hinter dem Läufer, leicht erhöht; der Blickwinkel wandert langsam mit, damit es nicht starr wirkt. */
function follow(w: number): Pose {
  const { pos } = walkAt(w);
  const angle = 0.6 + w * 0.9;
  const [x, z] = pos;
  return {
    pos: [x + Math.sin(angle) * 30, 24 - w * 4, z + Math.cos(angle) * 30],
    look: [x, 0.8, z],
  };
}

function blend(a: Pose, b: Pose, k: number): Pose {
  const e = ease(k);
  return {
    pos: [mix(a.pos[0], b.pos[0], e), mix(a.pos[1], b.pos[1], e), mix(a.pos[2], b.pos[2], e)],
    look: [mix(a.look[0], b.look[0], e), mix(a.look[1], b.look[1], e), mix(a.look[2], b.look[2], e)],
  };
}

/** Langsame Kreisbewegung um den Blickpunkt, damit stehende Abschnitte lebendig bleiben. */
function orbit(p: Pose, k: number, amount: number): Pose {
  const dx = p.pos[0] - p.look[0];
  const dz = p.pos[2] - p.look[2];
  const a = (k - 0.5) * amount;
  return {
    pos: [p.look[0] + dx * Math.cos(a) - dz * Math.sin(a), p.pos[1], p.look[2] + dx * Math.sin(a) + dz * Math.cos(a)],
    look: p.look,
  };
}

export function cameraAt(t: number): Pose {
  if (t < PHASE.compass[1]) return orbit(TOP, within(t, PHASE.compass), 0.4);
  if (t < PHASE.dive[1]) return blend(orbit(TOP, 1, 0.4), follow(0), within(t, PHASE.dive));
  if (t < PHASE.walk[1]) return follow(within(t, PHASE.walk));
  if (t < PHASE.team[1]) return blend(follow(1), orbit(OVERVIEW, within(t, PHASE.team), 0.5), Math.min(within(t, PHASE.team) * 1.6, 1));
  if (t < PHASE.drive[1]) return blend(orbit(OVERVIEW, 1, 0.5), DRIVE, within(t, PHASE.drive));
  if (t < PHASE.shield[1]) return blend(DRIVE, orbit(SHIELD, within(t, PHASE.shield), 0.6), within(t, PHASE.shield));
  return blend(orbit(SHIELD, 1, 0.6), TOP, within(t, PHASE.finale));
}

/** Ruhige Ansicht für "Bewegung reduzieren": eine feste Übersicht, nur Inhalte ändern sich. */
export const STILL_POSE: Pose = OVERVIEW;

export const WALK_FOCUS: Vec2 = ROUTE_CENTER;
