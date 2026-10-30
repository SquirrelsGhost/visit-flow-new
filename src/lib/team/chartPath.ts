export interface ChartPoint {
  x: number;
  y: number;
}

/**
 * Weiche Linie durch alle Punkte (Catmull-Rom als Bézier). Die Stützpunkte bleiben zwischen `minY` und `maxY`,
 * damit die Kurve nicht unter die Grundlinie schwingt.
 */
export function smoothPath(points: readonly ChartPoint[], minY: number, maxY: number): string {
  if (points.length === 0) return "";
  const first = points[0] as ChartPoint;
  if (points.length === 1) return `M${first.x},${first.y}`;
  const clamp = (y: number) => Math.min(maxY, Math.max(minY, y));
  let d = `M${first.x.toFixed(1)},${first.y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]!;
    const p1 = points[i]!;
    const p2 = points[i + 1]!;
    const p3 = points[i + 2] ?? p2;
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: clamp(p1.y + (p2.y - p0.y) / 6) };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: clamp(p2.y - (p3.y - p1.y) / 6) };
    d += ` C${c1.x.toFixed(1)},${c1.y.toFixed(1)} ${c2.x.toFixed(1)},${c2.y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }
  return d;
}

/** Schöne Obergrenze der Achse (1, 2, 2,5 oder 5 mal Zehnerpotenz), damit die Hilfslinien runde Werte treffen. */
export function niceMax(value: number): number {
  if (value <= 0) return 1;
  const power = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((s) => s * power >= value) ?? 10;
  return step * power;
}

/** Indizes für wenige, gleichmäßig verteilte Achsenbeschriftungen (erster und letzter Tag immer dabei). */
export function tickIndexes(count: number, ticks = 5): number[] {
  if (count <= ticks) return Array.from({ length: count }, (_, i) => i);
  const step = (count - 1) / (ticks - 1);
  return Array.from({ length: ticks }, (_, i) => Math.round(i * step));
}
