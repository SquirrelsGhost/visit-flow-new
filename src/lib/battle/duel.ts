import { involves, sortActiveBattles } from "./battleSelectors";
import type { Challenge } from "./battleTypes";

export type DuelSide = "left" | "right";

export interface DuelState {
  /** Anteil der linken Seite am Tauziehen-Balken, 0 bis 1 (0,5 bei Gleichstand). */
  share: number;
  leader: DuelSide | null;
  /** Vorsprung des Führenden in Punkten. */
  gap: number;
}

/** Stand eines Duells: wer führt, mit wie viel Vorsprung, und wie weit der Balken zu wem zeigt. */
export function duelState(left: number, right: number): DuelState {
  const total = left + right;
  const leader: DuelSide | null = left > right ? "left" : right > left ? "right" : null;
  // Bei 0:0 steht der Balken in der Mitte; ein Rand von 8 % hält beide Seiten sichtbar
  const raw = total === 0 ? 0.5 : left / total;
  return { share: Math.min(0.92, Math.max(0.08, raw)), leader, gap: Math.abs(left - right) };
}

export interface FeaturedDuel {
  battle: Challenge;
  mine: boolean;
}

/** Das Duell für den Kopf der Seite: das eigene, sonst das mit den meisten Punkten. */
export function featuredDuel(battles: Challenge[], meId: string, scoreOf: (id: string) => number): FeaturedDuel | null {
  const top = sortActiveBattles(battles, meId, scoreOf)[0];
  return top ? { battle: top, mine: involves(top, meId) } : null;
}

/** Wie hoch eine Zeile im Vergleich zur besten steht (für Balken), 0 bis 1. */
export const shareOfBest = (value: number, best: number) => (best > 0 ? Math.max(0, Math.min(1, value / best)) : 0);
