import { hapticFeedback, type HapticType } from "../device/haptics";
import { celebrate, playSound, type FeedbackSound } from "../feedback/feedback";
import { readPreference, writePreference } from "../preferences";

/**
 * Klang auf der Website: standardmäßig aus, weil niemand auf einer Website ungefragt Töne hören will.
 * Wer ihn in der Navigation einschaltet, hört die Glas-Klänge der App. Haptik (Handy) folgt den App-Einstellungen.
 */
const KEY = "vf-website-sound";
export const WEBSITE_SOUND_EVENT = "vf:website-sound";

export function isWebsiteSoundOn(): boolean {
  return readPreference(KEY) === "on";
}

export function setWebsiteSound(on: boolean): void {
  writePreference(KEY, on ? "on" : null);
  if (typeof window !== "undefined") window.dispatchEvent(new Event(WEBSITE_SOUND_EVENT));
}

const HAPTIC: Partial<Record<FeedbackSound, HapticType>> = {
  tap: "light",
  select: "light",
  success: "success",
  win: "celebrate",
  milestone: "light",
  sale: "success",
};

/** Ein Moment auf der Website: Haptik immer (falls erlaubt), Klang nur mit Schalter, Konfetti beim Sieg. */
export function siteFeedback(sound: FeedbackSound): void {
  const haptic = HAPTIC[sound];
  if (haptic) hapticFeedback(haptic);
  if (isWebsiteSoundOn()) playSound(sound);
  if (sound === "win") celebrate();
}

/** Nur Klang (wenn eingeschaltet), ohne Haptik: für viele kleine Momente wie aufleuchtende Türen. */
export function siteSound(sound: FeedbackSound): void {
  if (isWebsiteSoundOn()) playSound(sound);
}
