import { useEffect } from "react";
import { feedback, type FeedbackSound } from "../lib/feedback/feedback";
import { readPreference, writePreference } from "../lib/preferences";

/**
 * Spielt einen großen Moment genau einmal je `marker` (z. B. Battle-Sieg je Tag), auch über Neuladen hinweg.
 * `marker` null = gerade nichts zu feiern.
 */
export function useMomentOnce(key: string, marker: string | null, sound: FeedbackSound): void {
  useEffect(() => {
    if (!marker || readPreference(key) === marker) return;
    writePreference(key, marker);
    // Kurz warten, bis die Seite eingeblendet ist
    const timer = window.setTimeout(() => feedback(sound), 600);
    return () => window.clearTimeout(timer);
  }, [key, marker, sound]);
}
