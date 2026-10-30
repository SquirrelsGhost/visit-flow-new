import { useSyncExternalStore } from "react";
import { DEFAULT_FEEDBACK_PREFS, getFeedbackPrefs, setFeedbackPrefs, subscribeFeedbackPrefs } from "../lib/feedback/feedbackPrefs";

/** Schalter für Sounds, Haptik und Lautstärke dieses Geräts. */
export function useFeedbackPrefs() {
  const prefs = useSyncExternalStore(subscribeFeedbackPrefs, getFeedbackPrefs, () => DEFAULT_FEEDBACK_PREFS);
  return { prefs, update: setFeedbackPrefs };
}
