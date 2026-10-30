import { hasDemoSession } from "../auth/demoSession";
import type { Vertical } from "./battleCategories";
import { demoAdminBattles, demoDelay, demoSnapshot, demoState } from "./battleDemoStore";
import type {
  AdminBattle,
  ArenaUser,
  AutoAssignMode,
  BattleProduct,
  BattleSnapshot,
  InactiveBerater,
  PointConfig,
  ReadinessEntry,
  StreakMap,
} from "./battleTypes";
import { legacyRequest, listOf } from "./legacyRequest";

/** Laden der Arena. Im Demo-Modus kommen die Daten aus dem Beispielteam, sonst aus der API. */
export async function loadSnapshot(vertical: Vertical): Promise<BattleSnapshot> {
  if (hasDemoSession()) {
    await demoDelay(250);
    return demoSnapshot();
  }
  const [my, active, completed, readiness, top, streaks, points] = await Promise.all([
    legacyRequest("/challenges/my"),
    legacyRequest("/challenges/active"),
    legacyRequest("/challenges/completed"),
    legacyRequest(`/challenges/battle-readiness?vertical=${vertical}`),
    legacyRequest("/challenges/top-earners"),
    legacyRequest("/challenges/streaks"),
    legacyRequest(`/challenges/point-config?vertical=${vertical}`),
  ]);
  return {
    myChallenges: listOf(my, "challenges"),
    activeBattles: listOf(active, "challenges"),
    completedBattles: listOf(completed, "challenges"),
    readiness: {
      inactive: listOf<InactiveBerater>(readiness, "inactive"),
      sickToday: listOf<ReadinessEntry>(readiness, "sickToday"),
      newcomers: listOf<ReadinessEntry>(readiness, "newcomers"),
      experienced: listOf<ReadinessEntry>(readiness, "experienced"),
    },
    topEarners: listOf(top, "topEarners"),
    streaks: streaks.success ? ((streaks.streaks as StreakMap) ?? {}) : {},
    points: points.success && points.points ? (points.points as PointConfig) : null,
  };
}

export async function loadTeamUsers(): Promise<ArenaUser[]> {
  if (hasDemoSession()) return demoState().users;
  const body = await legacyRequest("/auth/team-members");
  const raw = Array.isArray(body.data) ? body.data : Array.isArray(body.users) ? body.users : [];
  return (raw as (ArenaUser & { _id?: string })[]).map((u) => ({ ...u, id: u.id || u._id || "" }));
}

export async function loadTeamProducts(teamId: string | undefined): Promise<BattleProduct[]> {
  if (hasDemoSession()) return demoState().products.map((p) => ({ ...p }));
  if (!teamId) return [];
  const body = await legacyRequest(`/products/team/${teamId}`);
  return listOf<BattleProduct & { _id?: string }>(body, "products").map((p) => ({ ...p, id: p.id || p._id || "" }));
}

export async function loadAutoAssignStatus(): Promise<{ enabled: boolean; mode: AutoAssignMode } | null> {
  if (hasDemoSession()) return { enabled: demoState().cronEnabled, mode: demoState().mode };
  const body = await legacyRequest("/challenges/auto-assign-status");
  return body.success ? { enabled: !!body.enabled, mode: (body.mode as AutoAssignMode) || "standard" } : null;
}

export async function loadAdminBattles(date: string): Promise<{ battles: AdminBattle[]; streaks: StreakMap } | null> {
  if (hasDemoSession()) {
    await demoDelay(300);
    return { battles: demoAdminBattles(date), streaks: demoState().streaks };
  }
  const [all, streaks] = await Promise.all([
    legacyRequest(`/challenges/admin/all?date=${date}`),
    legacyRequest(`/challenges/streaks?date=${date}`),
  ]);
  if (!all.success) return null;
  return { battles: listOf(all, "data"), streaks: (streaks.streaks as StreakMap) ?? {} };
}
