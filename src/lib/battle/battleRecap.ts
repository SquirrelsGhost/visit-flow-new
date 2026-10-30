import { berlinDay, previousDay } from "./arenaScore";
import type { Challenge, InactiveBerater } from "./battleTypes";

const DAY_NAMES = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
const MONTH_NAMES = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

export interface Recap {
  label: string;
  battles: Challenge[];
  wins: number;
  draws: number;
  absent: InactiveBerater[];
}

/**
 * Rückblick der Rückseite: gestern (Berliner Tag wie im Backend), sonst der letzte Tag mit Battles.
 * Wer an dem Tag gekämpft hat, steht nicht in "Heute nicht dabei".
 */
export function buildRecap(completed: Challenge[], inactive: InactiveBerater[], now = new Date()): Recap {
  const yesterday = previousDay(berlinDay(now));
  let battles = completed.filter((c) => c.date === yesterday);
  let label = "Gestern";
  if (battles.length === 0 && completed.length > 0) {
    const latest = [...new Set(completed.map((c) => c.date))].sort().reverse()[0];
    battles = completed.filter((c) => c.date === latest);
    const d = new Date(`${latest}T12:00:00`);
    label = `${DAY_NAMES[d.getDay()]}, ${d.getDate()}. ${MONTH_NAMES[d.getMonth()]}`;
  }
  const fought = new Set(battles.flatMap((b) => [b.challengerId, b.opponentId]));
  return {
    label,
    battles,
    wins: battles.filter((b) => b.winnerId).length,
    draws: battles.filter((b) => !b.winnerId).length,
    absent: inactive.filter((b) => !fought.has(b.userId)),
  };
}
