import { berlinDay, dayKey, statsByUser } from "./arenaScore";
import { defaultPoints } from "./battleCategories";
import {
  DEMO_ME,
  demoChallenges,
  demoProducts,
  demoReadiness,
  demoStreaks,
  demoTopEarners,
  demoUsers,
} from "./battleDemoData";
import type {
  AdminBattle,
  ArenaUser,
  AutoAssignMode,
  BattleProduct,
  BattleSnapshot,
  Challenge,
  PointConfig,
  Readiness,
  StreakMap,
  TopEarner,
} from "./battleTypes";

/** Zustand der Demo-Arena. Lebt nur im Speicher des Tabs, ein Neuladen setzt alles zurück. */
export interface DemoState {
  users: ArenaUser[];
  products: BattleProduct[];
  challenges: Challenge[];
  readiness: Readiness;
  streaks: StreakMap;
  topEarners: TopEarner[];
  points: PointConfig;
  cronEnabled: boolean;
  mode: AutoAssignMode;
  sickBy: Record<string, string>;
}

let state: DemoState | null = null;

export function demoState(): DemoState {
  state ??= {
    users: demoUsers(),
    products: demoProducts(),
    challenges: demoChallenges(),
    readiness: demoReadiness(),
    streaks: demoStreaks(),
    topEarners: demoTopEarners(),
    points: defaultPoints("telco"),
    cronEnabled: true,
    mode: "standard",
    sickBy: {},
  };
  return state;
}

/** Kurze Wartezeit, damit Ladezustände in der Demo so aussehen wie mit echter API. */
export const demoDelay = (ms = 380) => new Promise((resolve) => setTimeout(resolve, ms));

export const isLive = (c: Challenge) => c.status === "active" || c.status === "accepted";

export function demoSnapshot(): BattleSnapshot {
  const s = demoState();
  const today = berlinDay(new Date());
  return {
    myChallenges: s.challenges.filter((c) => c.challengerId === DEMO_ME || c.opponentId === DEMO_ME),
    activeBattles: s.challenges.filter((c) => isLive(c) && c.date === today),
    completedBattles: s.challenges.filter((c) => c.status === "completed"),
    readiness: s.readiness,
    topEarners: s.topEarners,
    streaks: s.streaks,
    points: s.points,
  };
}

const salesDetails = (userId: string, day: string) =>
  demoState()
    .products.filter((p) => p.userId === userId && p.timestamp && dayKey(new Date(p.timestamp)) === day)
    .map((p) => ({ type: p.type ?? p.category ?? "", timestamp: String(p.timestamp) }));

/** Battle-Historie eines Tages, wie /api/challenges/admin/all sie liefert. */
export function demoAdminBattles(date: string): AdminBattle[] {
  // Laufende Battles zeigen den Live-Stand aus den heutigen Sales
  const live = statsByUser(demoState().products, demoState().points, dayKey(new Date()));
  const scoreOf = (c: Challenge, id: string, stored: number) => (isLive(c) ? (live.get(id)?.score ?? 0) : stored);
  return demoState()
    .challenges.filter((c) => c.date === date && c.status !== "pending")
    .map((c) => ({
      _id: c.id,
      challengerId: c.challengerId,
      challengerName: c.challengerName,
      opponentId: c.opponentId,
      opponentName: c.opponentName,
      sickUserId: demoState().sickBy[c.id],
      challengerScore: scoreOf(c, c.challengerId, c.challengerScore),
      opponentScore: scoreOf(c, c.opponentId, c.opponentScore),
      status: c.status,
      isAutoAssigned: !!c.isAutoAssigned,
      date: c.date,
      createdAt: c.createdAt,
      challengerSalesDetails: salesDetails(c.challengerId, date),
      opponentSalesDetails: salesDetails(c.opponentId, date),
    }));
}
