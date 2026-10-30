import { useMemo } from "react";
import { hasDemoSession } from "../lib/auth/demoSession";
import type { Vertical } from "../lib/battle/battleCategories";
import { memberStats } from "../lib/overview/manageLogic";
import { DEMO_TEAM_ID } from "../lib/overview/teamDemoData";
import { localDay } from "../lib/overview/todayStats";
import { useAuth } from "./useAuth";
import { useNow } from "./useNow";
import { useTeamData } from "./useTeamData";

const MINUTE = 60_000;

/** Team seit Monatsanfang mit Zahlen je Mitglied; Grundlage der Verwaltung. */
export function useManageTeam(vertical: Vertical) {
  const { user } = useAuth();
  const now = useNow(MINUTE);
  const today = localDay(now);
  const teamId = typeof user?.teamId === "string" ? user.teamId : hasDemoSession() ? DEMO_TEAM_ID : undefined;
  // Ab Monatsanfang, mindestens aber ab Wochenbeginn und gestern (Auswertung der Struktur)
  const start = useMemo(() => {
    const day = new Date(`${today}T00:00:00`);
    const monday = new Date(day);
    monday.setDate(day.getDate() - ((day.getDay() + 6) % 7) - 1);
    return new Date(Math.min(new Date(`${today.slice(0, 7)}-01T00:00:00`).getTime(), monday.getTime()));
  }, [today]);
  const end = useMemo(() => new Date(`${today}T12:00:00`), [today]);
  const { data, loading, failed } = useTeamData(teamId, vertical, start, end);
  const users = useMemo(() => data.users.filter((u) => !teamId || !u.teamId || u.teamId === teamId), [data.users, teamId]);
  const stats = useMemo(() => memberStats(data, now), [data, now]);
  return { userId: user?.id, teamId, users, products: data.products, stats, now, loading, failed };
}
