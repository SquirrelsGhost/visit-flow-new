import { useEffect, useState } from "react";
import { loadMeMetrics } from "../lib/assistant/meApi";
import type { MeMetrics } from "../lib/assistant/meTypes";
import { loadAchievements, loadSubscription, loadTeamName, loadXp } from "../lib/profile/profileApi";
import type { Achievement, Subscription, XpProgress } from "../lib/profile/profileTypes";

/** Alles, was die Profilseite neben dem Benutzer lädt. undefined = lädt noch, null = keine Daten. */
export interface ProfileExtras {
  teamName?: string;
  xp?: XpProgress | null;
  subscription?: Subscription | null;
  achievements?: readonly Achievement[];
  metrics?: MeMetrics | null;
}

/** Lädt Team, Level, Abo, Erfolge und Tageszahlen parallel; jede Karte erscheint, sobald ihr Teil da ist. */
export function useProfileExtras(teamId: string | undefined): ProfileExtras {
  const [extras, setExtras] = useState<ProfileExtras>({});

  useEffect(() => {
    let alive = true;
    const put = (part: ProfileExtras) => alive && setExtras((prev) => ({ ...prev, ...part }));
    void loadTeamName(teamId).then((teamName) => put({ teamName }));
    void loadXp().then((xp) => put({ xp }));
    void loadSubscription().then((subscription) => put({ subscription }));
    void loadAchievements().then((achievements) => put({ achievements }));
    void loadMeMetrics().then((metrics) => put({ metrics }));
    return () => {
      alive = false;
    };
  }, [teamId]);

  return extras;
}
