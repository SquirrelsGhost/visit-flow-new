import type { LngLat } from "./lassoGeometry";

/** Lasso-Punkte mit Verlauf für Rückgängig/Wiederholen. */
export interface LassoHistory {
  past: LngLat[][];
  present: LngLat[];
  future: LngLat[][];
}

const LIMIT = 100;

export const emptyHistory = (points: LngLat[] = []): LassoHistory => ({ past: [], present: points, future: [] });

/** Neuer Stand; jede Änderung (Punkt setzen, ziehen, löschen, Freihand) ist ein Schritt. */
export function commit(h: LassoHistory, next: LngLat[]): LassoHistory {
  if (next === h.present) return h;
  return { past: [...h.past, h.present].slice(-LIMIT), present: next, future: [] };
}

export function undo(h: LassoHistory): LassoHistory {
  const prev = h.past.at(-1);
  if (!prev) return h;
  return { past: h.past.slice(0, -1), present: prev, future: [h.present, ...h.future] };
}

export function redo(h: LassoHistory): LassoHistory {
  const next = h.future[0];
  if (!next) return h;
  return { past: [...h.past, h.present], present: next, future: h.future.slice(1) };
}

export const movePoint = (points: LngLat[], index: number, to: LngLat) => points.map((p, i) => (i === index ? to : p));

/** Neuen Punkt hinter Punkt `afterIndex` einfügen (Zwischenpunkt einer Kante). */
export const insertPoint = (points: LngLat[], afterIndex: number, at: LngLat) => [
  ...points.slice(0, afterIndex + 1),
  at,
  ...points.slice(afterIndex + 1),
];

export const removePoint = (points: LngLat[], index: number) => points.filter((_, i) => i !== index);
