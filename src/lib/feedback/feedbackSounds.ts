import { air, tone } from "./feedbackSynth";

/** Alle Klänge der App. Pegel bewusst niedrig; die Lautstärke-Stufe skaliert sie gemeinsam. */
export type FeedbackSound =
  | "tap"
  | "select"
  | "toggleOn"
  | "toggleOff"
  | "sheetOpen"
  | "sheetClose"
  | "success"
  | "copy"
  | "sale"
  | "win"
  | "challenge"
  | "levelUp"
  | "milestone"
  | "warning"
  | "error"
  | "storno";

// Noten (Hz) für die musikalischen Klänge
const C6 = 1046.5;
const E6 = 1318.5;
const G6 = 1568;
const A6 = 1760;
const C7 = 2093;
const G5 = 784;
const C5 = 523.3;
const E5 = 659.3;

/** Rezept je Klang: schreibt Töne in den Ausgang `out`. */
export const SOUNDS: Record<FeedbackSound, (out: AudioNode) => void> = {
  // Feines, kaum hörbares Klicken wie ein Glas-Knopf
  tap: (out) => air(out, { dur: 0.03, peak: 0.22, from: 3200, to: 2400, q: 3 }),
  select: (out) => {
    air(out, { dur: 0.028, peak: 0.16, from: 2600, to: 2000, q: 3 });
    tone(out, { freq: 1900, dur: 0.05, peak: 0.025 });
  },
  toggleOn: (out) => {
    air(out, { dur: 0.026, peak: 0.18, from: 2200, to: 2000, q: 3 });
    tone(out, { freq: 1200, toFreq: 1600, dur: 0.07, peak: 0.04, at: 0.015 });
  },
  toggleOff: (out) => {
    air(out, { dur: 0.026, peak: 0.15, from: 1900, to: 1600, q: 3 });
    tone(out, { freq: 1300, toFreq: 950, dur: 0.07, peak: 0.035, at: 0.015 });
  },
  // Weicher Luftzug: hinauf beim Öffnen, hinab beim Schließen
  sheetOpen: (out) => air(out, { dur: 0.26, peak: 0.07, from: 380, to: 1900, q: 0.9 }),
  sheetClose: (out) => air(out, { dur: 0.2, peak: 0.055, from: 1700, to: 360, q: 0.9 }),
  // "Tick-Ting"
  success: (out) => {
    tone(out, { freq: E6, dur: 0.22, peak: 0.07, bell: true });
    tone(out, { freq: A6, dur: 0.42, peak: 0.08, at: 0.07, bell: true });
  },
  copy: (out) => {
    air(out, { dur: 0.025, peak: 0.16, from: 3000, to: 2600, q: 3 });
    tone(out, { freq: G6, dur: 0.16, peak: 0.05, at: 0.03, bell: true });
  },
  // Warmes, edles Pling in Dur für einen Verkauf
  sale: (out) => {
    tone(out, { freq: C6, dur: 0.5, peak: 0.08, bell: true });
    tone(out, { freq: E6, dur: 0.55, peak: 0.075, at: 0.08, bell: true });
    tone(out, { freq: G6, dur: 0.8, peak: 0.08, at: 0.16, bell: true });
    tone(out, { freq: C7, dur: 0.9, peak: 0.035, at: 0.26 });
    air(out, { dur: 0.5, peak: 0.02, from: 6000, to: 9000, q: 0.7, at: 0.2 });
  },
  // Kleine Fanfare für einen gewonnenen Battle
  win: (out) => {
    [G5, C6, E6].forEach((freq, i) => tone(out, { freq, dur: 0.18, peak: 0.07, at: i * 0.085, type: "triangle" }));
    tone(out, { freq: G6, dur: 1.0, peak: 0.08, at: 0.27, type: "triangle" });
    tone(out, { freq: C7, dur: 1.1, peak: 0.04, at: 0.3, bell: true });
    air(out, { dur: 0.7, peak: 0.025, from: 5000, to: 9000, q: 0.6, at: 0.3 });
  },
  // Kurzer Anlauf und Schlag: Herausforderung gesendet oder angenommen
  challenge: (out) => {
    tone(out, { freq: 220, toFreq: 440, dur: 0.16, peak: 0.08, type: "triangle" });
    tone(out, { freq: E5, dur: 0.3, peak: 0.07, at: 0.12, type: "triangle" });
    tone(out, { freq: C6, dur: 0.35, peak: 0.05, at: 0.12, bell: true });
  },
  // Aufsteigender Glanz für ein neues Level
  levelUp: (out) => {
    tone(out, { freq: 520, toFreq: 1560, dur: 0.38, peak: 0.05, type: "triangle", attack: 0.03 });
    [C6, E6, G6, C7].forEach((freq, i) => tone(out, { freq, dur: 0.6, peak: 0.055, at: 0.28 + i * 0.07, bell: true }));
  },
  // Dezenter Funke, z. B. wenn ein Rechner-Ergebnis eine Schwelle knackt
  milestone: (out) => {
    tone(out, { freq: G6, dur: 0.3, peak: 0.05, bell: true });
    tone(out, { freq: C7, dur: 0.45, peak: 0.04, at: 0.06, bell: true });
  },
  warning: (out) => {
    tone(out, { freq: A6 / 2, dur: 0.18, peak: 0.06, type: "triangle" });
    tone(out, { freq: A6 / 2, dur: 0.22, peak: 0.05, at: 0.14, type: "triangle" });
  },
  // Weich und tief, nie schrill
  error: (out) => {
    tone(out, { freq: 330, dur: 0.2, peak: 0.09, type: "triangle" });
    tone(out, { freq: 262, dur: 0.32, peak: 0.09, at: 0.12, type: "triangle" });
  },
  storno: (out) => {
    tone(out, { freq: E5, toFreq: C5, dur: 0.32, peak: 0.07, type: "triangle" });
    air(out, { dur: 0.22, peak: 0.03, from: 1200, to: 300, q: 0.8 });
  },
};
