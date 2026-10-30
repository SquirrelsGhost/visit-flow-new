import { useEffect, useMemo, useState } from "react";
import { hasDemoSession } from "../lib/auth/demoSession";
import type { Vertical } from "../lib/battle/battleCategories";
import { CONTESTS_UPDATED_EVENT, cachedContests, syncContests } from "../lib/overview/contestApi";
import { contestsForUser } from "../lib/overview/contestLogic";
import type { Contest } from "../lib/overview/contestTypes";
import { DEMO_TEAM_ID } from "../lib/overview/teamDemoData";

/**
 * Laufende und geplante Gewinnspiele des Nutzers (v1 SwipeableDailyView + incentiveApi).
 * Zeigt sofort den Cache, holt dann den Serverstand und zieht bei jeder Änderung nach.
 */
export function useContests(userId: string | undefined, userTeamId: string | undefined, vertical: Vertical) {
  const [all, setAll] = useState<Contest[]>(() => (typeof window === "undefined" ? [] : cachedContests(vertical)));

  useEffect(() => {
    let alive = true;
    const reread = () => alive && setAll(cachedContests(vertical));
    void syncContests(vertical).then((list) => alive && setAll(list), reread);
    window.addEventListener(CONTESTS_UPDATED_EVENT, reread);
    window.addEventListener("storage", reread);
    return () => {
      alive = false;
      window.removeEventListener(CONTESTS_UPDATED_EVENT, reread);
      window.removeEventListener("storage", reread);
    };
  }, [vertical]);

  const mine = useMemo(() => {
    if (!userId) return [];
    const teamId = userTeamId ?? (hasDemoSession() ? DEMO_TEAM_ID : undefined);
    return contestsForUser(all, { id: userId, teamId });
  }, [all, userId, userTeamId]);

  return { all, contests: mine };
}
