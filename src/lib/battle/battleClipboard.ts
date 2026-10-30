import type { Challenge, StreakMap } from "./battleTypes";

/** Texte zum Teilen in WhatsApp, Format wie in v1. */
const streakLabel = (streaks: StreakMap, id: string) => {
  const s = streaks[id];
  if (s?.streak > 0) return ` (↑${s.streak})`;
  if (s?.loseStreak > 0) return ` (↓${s.loseStreak})`;
  return "";
};

export function activeBattlesText(battles: Challenge[], streaks: StreakMap, now = new Date()): string {
  const date = now.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Berlin" });
  const lines = battles.map(
    (b) => `${b.challengerName}${streakLabel(streaks, b.challengerId)} ⚔️ ${b.opponentName}${streakLabel(streaks, b.opponentId)}`,
  );
  return `⚔️ *Aktive Battles — ${date}*\n\n↑ Siegesserie | ↓ Niederlagenserie\n\n${lines.join("\n\n")}`;
}

/** Siegesserien ab 2 Siegen, absteigend; null wenn es keine gibt. */
export function winnerStreaksText(streaks: StreakMap, date: string): string | null {
  const winners = Object.values(streaks)
    .filter((w) => w.streak >= 2 && w.name)
    .sort((a, b) => b.streak - a.streak);
  if (winners.length === 0) return null;
  const formatted = new Date(`${date}T00:00:00`).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
  return `Siegesserien vom ${formatted}:\n\n${winners.map((w, i) => `${i + 1}. ${w.name} (↑${w.streak})`).join("\n")}\n`;
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
