import { useMemo } from "react";
import { hasDemoSession } from "../lib/auth/demoSession";
import { DEMO_COACH_PROFILE } from "../lib/coach/coachDemo";
import { buildCoachProfile } from "../lib/coach/coachProfile";
import type { CoachProfile } from "../lib/coach/coachTypes";
import { readStoredHouses } from "../lib/map/mapStorage";
import { useVertical } from "./useVertical";

/**
 * Coach-Profil des Nutzers aus den lokal gespeicherten Kartenhäusern. Wird bei jedem Öffnen
 * des Chats neu gerechnet (`version` hochzählen), damit die Türen von eben schon mitzählen.
 */
export function useCoachProfile(version: number): CoachProfile | null {
  const vertical = useVertical();
  return useMemo(() => {
    if (typeof window === "undefined") return null;
    const profile = buildCoachProfile(readStoredHouses(), vertical);
    return profile.doors === 0 && hasDemoSession() ? DEMO_COACH_PROFILE : profile;
    // version zählt nur als Auslöser für das Neurechnen
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vertical, version]);
}
