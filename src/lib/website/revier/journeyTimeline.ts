/**
 * Drehbuch der Reise: Der Scrollfortschritt t (0 bis 1) steuert Kamera, Viertel und Texte.
 * Alle Abschnitte stehen hier, damit Szene und Texte immer zusammenpassen.
 */
export const PHASE = {
  compass: [0, 0.07],
  dive: [0.07, 0.17],
  walk: [0.17, 0.46],
  team: [0.46, 0.6],
  drive: [0.6, 0.72],
  shield: [0.72, 0.84],
  finale: [0.84, 1],
} as const satisfies Record<string, readonly [number, number]>;

export type PhaseKey = keyof typeof PHASE;

/** Fortschritt innerhalb eines Abschnitts, auf 0 bis 1 begrenzt. */
export function within(t: number, [a, b]: readonly [number, number]): number {
  return Math.min(Math.max((t - a) / (b - a), 0), 1);
}

/** Weiches Anfahren und Abbremsen. */
export function ease(k: number): number {
  return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
}

export function mix(a: number, b: number, k: number): number {
  return a + (b - a) * k;
}

/** Abschnitt des Rundgangs, an dem Verkauf, Enes und CRM gezeigt werden (Anteile von PHASE.walk). */
export const WALK_BEATS = { map: [0, 0.34], sale: [0.34, 0.67], coach: [0.67, 1] } as const;
