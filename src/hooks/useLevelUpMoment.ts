import { useEffect } from "react";
import { feedback } from "../lib/feedback/feedback";
import { readPreference, writePreference } from "../lib/preferences";

const KEY = "vf-moment-level";

/** Feiert einen Level-Aufstieg einmal, wenn das Level höher ist als beim letzten Besuch. Beim ersten Besuch wird es nur gemerkt. */
export function useLevelUpMoment(level: number | undefined): void {
  useEffect(() => {
    if (level === undefined) return;
    const last = readPreference(KEY);
    writePreference(KEY, String(level));
    if (last === null || level <= Number(last)) return;
    // Kurz warten, bis der XP-Ring sich füllt
    const timer = window.setTimeout(() => feedback("levelUp"), 900);
    return () => window.clearTimeout(timer);
  }, [level]);
}
