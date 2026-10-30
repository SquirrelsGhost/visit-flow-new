import type { Challenge } from "../battle/battleTypes";

/** Marke des letzten Battle-Siegs (Tag + Battle), oder null, wenn ich im Rückblick nicht gewonnen habe. */
export function battleWinMarker(battles: readonly Challenge[], meId: string): string | null {
  if (!meId) return null;
  const won = battles.find((b) => b.winnerId === meId);
  return won ? `${won.date}:${won.id}` : null;
}

