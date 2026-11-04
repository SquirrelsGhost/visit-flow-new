import * as THREE from "three";
import { LOGO, LOGO_BG, RING_STOPS, type GradientStops } from "../../logoSpec";

/**
 * Das echte Visit-Flow-Logo als 3D-Geometrie, Maße aus logoSpec (favicon.svg, hier Mitte 0/0, Norden = +y).
 * Verläufe laufen wie im SVG im sRGB-Raum, deshalb Farben pro Ecke statt Texturen: bleibt in jeder Größe scharf.
 */
const SEGMENTS = 256;

/** Eigene Ebene für das Logo: so bleibt es beim Leuchten (Bloom) außen vor und überstrahlt nicht. */
export const LOGO_LAYER = 1;

const srgb = (hex: string) => new THREE.Color(hex).getRGB(new THREE.Color(), THREE.SRGBColorSpace);

/** Farbe an Stelle f eines SVG-Verlaufs, gemischt in sRGB wie im Browser. */
export function gradientAt(stops: GradientStops, f: number): THREE.Color {
  const k = Math.min(Math.max(f, 0), 1);
  const i = Math.max(stops.findIndex(([at]) => at >= k), 1);
  const [a0, c0] = stops[i - 1];
  const [a1, c1] = stops[i];
  const m = a1 === a0 ? 0 : (k - a0) / (a1 - a0);
  const x = srgb(c0);
  const y = srgb(c1);
  return new THREE.Color().setRGB(x.r + (y.r - x.r) * m, x.g + (y.g - x.g) * m, x.b + (y.b - x.b) * m, THREE.SRGBColorSpace);
}

function paint(geo: THREE.BufferGeometry, colorAt: (x: number, y: number) => THREE.Color, alphaAt?: (x: number, y: number) => number) {
  const pos = geo.getAttribute("position");
  const size = alphaAt ? 4 : 3;
  const data = new Float32Array(pos.count * size);
  for (let i = 0; i < pos.count; i++) {
    const c = colorAt(pos.getX(i), pos.getY(i));
    data.set(alphaAt ? [c.r, c.g, c.b, alphaAt(pos.getX(i), pos.getY(i))] : [c.r, c.g, c.b], i * size);
  }
  geo.setAttribute("color", new THREE.BufferAttribute(data, size));
  return geo;
}

/** Diagonaler Verlauf des SVG (objectBoundingBox 0/0 → 100 %/100 %): oben links hell, unten rechts dunkler. */
const diagonal = (r: number) => (x: number, y: number) => gradientAt(RING_STOPS, ((x + r) / (2 * r) + (r - y) / (2 * r)) / 2);

export function ringGeometry(r: number, stroke: number): THREE.BufferGeometry {
  return paint(new THREE.RingGeometry(r - stroke / 2, r + stroke / 2, SEGMENTS, 1), diagonal(r));
}

/** Leuchten am Außenring: Strich der Breite stroke, mit Gauß weichgezeichnet (wie feGaussianBlur). */
export function glowGeometry(r: number, stroke: number, sigma: number): THREE.BufferGeometry {
  const reach = stroke / 2 + sigma * 3.2;
  const erf = (x: number) => Math.tanh(1.1283792 * x * (1 + 0.0894 * x * x));
  const alpha = (x: number, y: number) => {
    const d = Math.abs(Math.hypot(x, y) - r);
    const s = sigma * Math.SQRT2;
    return 0.5 * (erf((d + stroke / 2) / s) - erf((d - stroke / 2) / s));
  };
  return paint(new THREE.RingGeometry(r - reach, r + reach, SEGMENTS, 24), diagonal(r), alpha);
}

/** Dunkle Scheibe mit radialem Verlauf von der Mitte zum Rand. */
export function discGeometry(r: number): THREE.BufferGeometry {
  return paint(new THREE.CircleGeometry(r, SEGMENTS), (x, y) => new THREE.Color(Math.hypot(x, y) < 1e-6 ? LOGO_BG.center : LOGO_BG.rim));
}

/**
 * Nadelhälfte als Pfeil mit Kerbe: Spitze (0, tip), Fuß (±half, 0), Kerbe (0, notch).
 * Für Süden gespiegelt (dir = -1). Reihen alle 10 % entlang der Nadel, damit der Verlauf exakt sitzt.
 */
export function needleGeometry(dir: 1 | -1, stops: GradientStops): THREE.BufferGeometry {
  const { needleTip: T, needleHalf: H, notch: N } = LOGO;
  const fAt = (y: number) => (dir === 1 ? (T - y) / T : y / T);
  const pts: number[] = [];
  const cols: number[] = [];
  const add = (x: number, y: number) => {
    pts.push(x, y * dir, 0);
    const c = gradientAt(stops, fAt(y));
    cols.push(c.r, c.g, c.b);
    return pts.length / 3 - 1;
  };
  const tip = add(0, T);
  const rows: [number, number][] = [];
  for (let f = 0.1; f < 0.95; f += 0.1) {
    const y = T * (1 - f);
    const half = H * (1 - y / T);
    rows.push([add(-half, y), add(half, y)]);
  }
  const index: number[] = [tip, rows[0][0], rows[0][1]];
  for (let i = 0; i < rows.length - 1; i++) {
    const [l0, r0] = rows[i];
    const [l1, r1] = rows[i + 1];
    index.push(l0, l1, r1, l0, r1, r0);
  }
  const [lastL, lastR] = rows[rows.length - 1];
  const baseL = add(-H, 0);
  const baseR = add(H, 0);
  const notch = add(0, N);
  index.push(lastL, notch, lastR, lastR, notch, baseR, lastL, baseL, notch);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));
  geo.setIndex(index);
  return geo;
}

/** Feiner Umriss der Nadelhälfte (stroke 0.5 im SVG): schmale Bänder mittig auf den vier Kanten. */
export function needleOutline(dir: 1 | -1): THREE.BufferGeometry {
  const { needleTip: T, needleHalf: H, notch: N, needleStroke: w } = LOGO;
  const corners = [[0, T], [-H, 0], [0, N], [H, 0]].map(([x, y]) => new THREE.Vector2(x, y * dir));
  const pts: number[] = [];
  corners.forEach((p, i) => {
    const q = corners[(i + 1) % corners.length];
    const n = new THREE.Vector2(p.y - q.y, q.x - p.x).setLength(w / 2);
    const quad = [p.clone().add(n), p.clone().sub(n), q.clone().sub(n), q.clone().add(n)];
    [0, 1, 2, 0, 2, 3].forEach((k) => pts.push(quad[k].x, quad[k].y, 0));
  });
  return new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
}
