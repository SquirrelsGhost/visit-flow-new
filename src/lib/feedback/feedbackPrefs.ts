import { readPreference, writePreference } from "../preferences";

export type FeedbackVolume = "low" | "medium" | "high";

/** Sound und Haptik gelten je Gerät (wie Revolut), deshalb lokal und nicht in den Konto-Einstellungen. */
export interface FeedbackPrefs {
  sound: boolean;
  haptics: boolean;
  volume: FeedbackVolume;
}

const KEY = "vf-feedback";
/** Standard: Sounds an, aber leise, damit nichts aufdringlich wirkt. */
export const DEFAULT_FEEDBACK_PREFS: FeedbackPrefs = { sound: true, haptics: true, volume: "low" };
export const FEEDBACK_VOLUMES: readonly FeedbackVolume[] = ["low", "medium", "high"];

/** Hauptlautstärke je Stufe; jeder Klang hat darunter noch seinen eigenen Pegel. */
export const VOLUME_GAIN: Record<FeedbackVolume, number> = { low: 0.32, medium: 0.6, high: 1 };

let cached: FeedbackPrefs | null = null;
const listeners = new Set<() => void>();

function parse(raw: string | null): FeedbackPrefs {
  if (!raw) return DEFAULT_FEEDBACK_PREFS;
  try {
    const value = JSON.parse(raw) as Partial<FeedbackPrefs>;
    return {
      sound: typeof value.sound === "boolean" ? value.sound : DEFAULT_FEEDBACK_PREFS.sound,
      haptics: typeof value.haptics === "boolean" ? value.haptics : DEFAULT_FEEDBACK_PREFS.haptics,
      volume: FEEDBACK_VOLUMES.includes(value.volume as FeedbackVolume) ? (value.volume as FeedbackVolume) : DEFAULT_FEEDBACK_PREFS.volume,
    };
  } catch {
    return DEFAULT_FEEDBACK_PREFS;
  }
}

export function getFeedbackPrefs(): FeedbackPrefs {
  if (typeof window === "undefined") return DEFAULT_FEEDBACK_PREFS;
  cached ??= parse(readPreference(KEY));
  return cached;
}

export function setFeedbackPrefs(change: Partial<FeedbackPrefs>): void {
  cached = { ...getFeedbackPrefs(), ...change };
  writePreference(KEY, JSON.stringify(cached));
  listeners.forEach((listener) => listener());
}

export function subscribeFeedbackPrefs(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
