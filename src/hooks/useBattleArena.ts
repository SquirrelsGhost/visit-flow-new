import { useCallback, useMemo } from "react";
import { dayKey, statsByUser, type DayStats } from "../lib/battle/arenaScore";
import type { Vertical } from "../lib/battle/battleCategories";
import { canManageBattles } from "../lib/battle/battleCategories";
import { eligibleMembers } from "../lib/battle/battleSelectors";
import type { Readiness } from "../lib/battle/battleTypes";
import { useAuth } from "./useAuth";
import { useBattleActions } from "./useBattleActions";
import { useBattleData } from "./useBattleData";
import { useBattlePoints } from "./useBattlePoints";

const NO_STATS: DayStats = { sales: 0, score: 0, commission: 0 };
const NO_READINESS: Readiness = { inactive: [], sickToday: [], newcomers: [], experienced: [] };

/** Alles, was die Arena-Seite braucht: Daten, Tageswerte pro Person und Aktionen. */
export function useBattleArena(vertical: Vertical) {
  const { user } = useAuth();
  const meId = user?.id ?? "";
  const teamId = typeof user?.teamId === "string" ? user.teamId : undefined;
  const data = useBattleData(vertical, teamId);
  const points = useBattlePoints(vertical, data.snapshot?.points ?? null);
  const actions = useBattleActions(data.reload, data.refreshProducts);

  // Heutige Sales, Punkte und Provision pro Person aus einem Durchlauf, wie in v1
  const today = dayKey(new Date());
  const dayStats = useMemo(() => statsByUser(data.products, points.config, today), [data.products, points.config, today]);
  const statsOf = useCallback((id: string) => dayStats.get(id) ?? NO_STATS, [dayStats]);
  const scoreOf = useCallback((id: string) => statsOf(id).score, [statsOf]);

  const snapshot = data.snapshot;
  const readiness = snapshot?.readiness ?? NO_READINESS;
  const members = useMemo(
    () => eligibleMembers(readiness, data.users, meId, statsOf),
    [readiness, data.users, meId, statsOf],
  );

  const mine = snapshot?.myChallenges ?? [];
  return {
    user,
    meId,
    today,
    loaded: snapshot !== null,
    canManage: canManageBattles(user?.role),
    snapshot,
    readiness,
    users: data.users,
    products: data.products,
    dayStats,
    statsOf,
    scoreOf,
    members,
    pending: mine.filter((c) => c.status === "pending" && c.opponentId === meId),
    outgoing: mine.filter((c) => c.status === "pending" && c.challengerId === meId),
    active: snapshot?.activeBattles ?? [],
    streaks: snapshot?.streaks ?? {},
    points,
    actions,
    reload: data.reload,
    refresh: () => {
      data.debouncedReload();
      void data.refreshProducts();
    },
  };
}

export type BattleArenaState = ReturnType<typeof useBattleArena>;
