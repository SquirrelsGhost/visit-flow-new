/** Bildwerte eines Ausweis-Ausschnitts in Graustufen (verkleinert), Grundlage für die automatische Aufnahme. */
export interface CardFrameStats {
  mean: number;
  contrast: number;
  /** Anteil fast weißer Pixel (Spiegelung). */
  glare: number;
  /** Varianz des Laplace-Filters: hoch = scharf. */
  sharpness: number;
}

export function toGray(rgba: Uint8ClampedArray): Uint8Array {
  const gray = new Uint8Array(rgba.length / 4);
  for (let i = 0, j = 0; i < rgba.length; i += 4, j++) gray[j] = (rgba[i] * 77 + rgba[i + 1] * 150 + rgba[i + 2] * 29) >> 8;
  return gray;
}

export function cardStats(gray: Uint8Array, width: number, height: number): CardFrameStats {
  let sum = 0, sumSq = 0, bright = 0;
  for (const v of gray) {
    sum += v;
    sumSq += v * v;
    if (v >= 250) bright++;
  }
  const n = gray.length || 1;
  const mean = sum / n;
  let lapSum = 0, lapSq = 0, count = 0;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;
      const lap = 4 * gray[i] - gray[i - 1] - gray[i + 1] - gray[i - width] - gray[i + width];
      lapSum += lap;
      lapSq += lap * lap;
      count++;
    }
  }
  const lapMean = lapSum / (count || 1);
  return { mean, contrast: Math.sqrt(Math.max(0, sumSq / n - mean * mean)), glare: bright / n, sharpness: lapSq / (count || 1) - lapMean * lapMean };
}

/** Mittlere Helligkeitsänderung zum letzten Bild: klein = Ausweis wird ruhig gehalten. */
export function frameMotion(prev: Uint8Array | null, cur: Uint8Array): number {
  if (!prev || prev.length !== cur.length) return 255;
  let diff = 0;
  for (let i = 0; i < cur.length; i++) diff += Math.abs(cur[i] - prev[i]);
  return diff / cur.length;
}

export type CardHint = "dark" | "glare" | "noCard" | "noPortrait" | "flip" | "showBack" | "blurry" | "holdStill";

export interface CardCheckInput {
  side: "front" | "back";
  stats: CardFrameStats;
  motion: number;
  /** Gesicht im Ausschnitt (Lichtbild), Mitte und Höhe relativ zum Ausschnitt. */
  portrait: { cx: number; cy: number; height: number } | null;
  /** 1 = volle Strenge; sinkt, wenn es lange nicht klappt, damit niemand hängen bleibt. */
  strictness: number;
}

/** Bewertet ein Bild: erster Hinweis, der noch nicht passt, oder null = bereit zur Aufnahme. */
export function cardHint({ side, stats, motion, portrait, strictness }: CardCheckInput): CardHint | null {
  if (stats.mean < 55) return "dark";
  if (stats.glare > 0.03 / strictness) return "glare";
  if (stats.contrast < 22 * strictness) return "noCard";
  if (side === "front") {
    if (!portrait) return "noPortrait";
    if (portrait.cx > 0.55) return "flip";
  } else if (portrait && portrait.height > 0.25) {
    return "showBack";
  }
  if (stats.sharpness < 120 * strictness) return "blurry";
  if (motion > 7 / strictness) return "holdStill";
  return null;
}
