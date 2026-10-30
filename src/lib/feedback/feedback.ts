import { hapticFeedback, type HapticType } from "../device/haptics";
import { getFeedbackPrefs, VOLUME_GAIN } from "./feedbackPrefs";
import { SOUNDS, type FeedbackSound } from "./feedbackSounds";
import { audioContext, output } from "./feedbackSynth";

export type { FeedbackSound } from "./feedbackSounds";

/** Haptik je Moment; Sheets vibrieren nicht, das wäre zu viel. */
const HAPTIC: Partial<Record<FeedbackSound, HapticType>> = {
  tap: "light",
  select: "light",
  toggleOn: "light",
  toggleOff: "light",
  success: "success",
  copy: "light",
  sale: "celebrate",
  win: "celebrate",
  challenge: "medium",
  levelUp: "celebrate",
  milestone: "light",
  warning: "warning",
  error: "error",
  storno: "medium",
};

/** Momente, die zusätzlich Konfetti auslösen. */
const CELEBRATE: ReadonlySet<FeedbackSound> = new Set(["sale", "win", "levelUp"]);

/** Window-Ereignis, auf das die Konfetti-Ebene hört. */
export const CELEBRATE_EVENT = "vf:celebrate";

/** Zeitpunkt des letzten großen Klangs: die Erfolgsmeldung direkt danach bleibt dann still, statt doppelt zu klingen. */
let lastExplicit = 0;
const QUIET_AFTER_MS = 900;

/** Spielt nur den Klang (z. B. zum Vorhören), ohne Haptik und Konfetti. */
export function playSound(sound: FeedbackSound): void {
  const prefs = getFeedbackPrefs();
  if (!prefs.sound || typeof document === "undefined" || document.hidden) return;
  const audio = audioContext();
  if (!audio) return;
  try {
    if (audio.state !== "running") void audio.resume().catch(() => undefined);
    SOUNDS[sound](output(audio, VOLUME_GAIN[prefs.volume]));
  } catch {
    // Ohne Ton geht es auch
  }
}

/** Startet die Konfetti-Ebene (bei reduzierter Bewegung bleibt sie aus). */
export function celebrate(): void {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(CELEBRATE_EVENT));
}

/**
 * Der zentrale Aufruf für einen Moment in der App: Klang, passende Haptik und bei großen Momenten Konfetti.
 * Alles respektiert die Schalter in Einstellungen → App → Sounds & Haptik.
 */
export function feedback(sound: FeedbackSound): void {
  if (sound !== "tap" && sound !== "select" && sound !== "sheetOpen" && sound !== "sheetClose") lastExplicit = Date.now();
  playSound(sound);
  const haptic = HAPTIC[sound];
  if (haptic) hapticFeedback(haptic);
  if (CELEBRATE.has(sound)) celebrate();
}

/** Für Erfolgs- und Fehlermeldungen (Toasts): klingt nur, wenn nicht gerade schon ein eigener Moment klang. */
export function toastFeedback(sound: FeedbackSound): void {
  if (Date.now() - lastExplicit < QUIET_AFTER_MS) return;
  feedback(sound);
}
