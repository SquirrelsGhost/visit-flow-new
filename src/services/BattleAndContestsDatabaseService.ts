import { randomUUID } from "node:crypto";
import type { Vertical } from "@/lib/battle/battleCategories";
import { demoAdminBattles, demoSnapshot, demoState } from "@/lib/battle/battleDemoStore";
import type { AutoAssignMode, PointConfig, StreakMap } from "@/lib/battle/battleTypes";
import { demoContests } from "@/lib/overview/contestDemoData";
import type { Contest } from "@/lib/overview/contestTypes";
import type { StoredRecord } from "./store/RecordStore";
import { createStore } from "./store/storeFactory";

interface StoredChallengeRecord extends StoredRecord {
  id: string;
  challengerId: string;
  opponentId: string;
  status: "pending" | "active" | "completed" | "declined" | "cancelled";
  receivedAt: string;
}

interface StoredBattleSettingsRecord extends StoredRecord {
  id: string;
  enabled: boolean;
  mode: AutoAssignMode;
  points: Record<string, PointConfig>;
  streaks: StreakMap;
  sickUserIds: string[];
  inactiveUserIds: string[];
  receivedAt: string;
}

interface StoredContestRecord extends Contest, StoredRecord {
  id: string;
  receivedAt: string;
}

const challengeStore = () => createStore<StoredChallengeRecord>("battle-challenges");
const battleSettingsStore = () => createStore<StoredBattleSettingsRecord>("battle-duels");
const contestStore = () => createStore<StoredContestRecord>("contests");

async function loadBattleSettings(): Promise<StoredBattleSettingsRecord> {
  const existing = await battleSettingsStore().get("global");
  if (existing) return existing;
  const snap = demoSnapshot();
  const seeded: StoredBattleSettingsRecord = {
    id: "global",
    enabled: true,
    mode: "standard",
    points: snap.points ? { telco: snap.points } : {},
    streaks: snap.streaks ?? {},
    sickUserIds: [],
    inactiveUserIds: [],
    receivedAt: new Date().toISOString(),
  };
  await battleSettingsStore().upsert(seeded);
  return seeded;
}

export class BattleAndContestsDatabaseService {
  static async getSnapshot(vertical: Vertical) {
    const snap = demoSnapshot();
    const settings = await loadBattleSettings();
    const customChallenges = await challengeStore().list();
    return {
      myChallenges: customChallenges.length > 0 ? customChallenges : snap.myChallenges,
      activeBattles: snap.activeBattles,
      completedBattles: snap.completedBattles,
      readiness: snap.readiness,
      topEarners: snap.topEarners,
      streaks: settings.streaks,
      points: settings.points[vertical] ?? snap.points,
    };
  }

  static async createChallenge(challengerId: string, opponentId: string) {
    const now = new Date().toISOString();
    const created: StoredChallengeRecord = {
      id: `ch-${randomUUID().slice(0, 8)}`,
      challengerId,
      opponentId,
      status: "pending",
      receivedAt: now,
    };
    await challengeStore().upsert(created);
    return created;
  }

  static async respondChallenge(id: string, action: "accept" | "decline") {
    return challengeStore().update(id, (curr) => ({
      ...curr,
      status: action === "accept" ? "active" : "declined",
    }));
  }

  static async cancelChallenge(id: string) {
    await challengeStore().removeWhere((c) => c.id === id);
    return { cancelled: true };
  }

  static async getAutoAssignStatus() {
    const s = await loadBattleSettings();
    return { enabled: s.enabled, mode: s.mode };
  }

  static async updateAutoAssign(patch: { enabled?: boolean; mode?: AutoAssignMode }) {
    const s = await loadBattleSettings();
    const next: StoredBattleSettingsRecord = {
      ...s,
      enabled: patch.enabled ?? s.enabled,
      mode: patch.mode ?? s.mode,
    };
    await battleSettingsStore().upsert(next);
    return { enabled: next.enabled, mode: next.mode };
  }

  static async savePointConfig(vertical: Vertical, points: PointConfig) {
    const s = await loadBattleSettings();
    const next: StoredBattleSettingsRecord = {
      ...s,
      points: { ...s.points, [vertical]: points },
    };
    await battleSettingsStore().upsert(next);
    return { points };
  }

  static async resetStreaks() {
    const s = await loadBattleSettings();
    await battleSettingsStore().upsert({ ...s, streaks: {} });
    return { reset: true };
  }

  static async getAdminBattles(date: string) {
    const s = await loadBattleSettings();
    return {
      data: demoAdminBattles(date),
      streaks: s.streaks ?? demoState().streaks,
    };
  }

  static async listContests(vertical: Vertical = "telco"): Promise<Contest[]> {
    const stored = await contestStore().list();
    if (stored.length > 0) return stored;
    const seeded = demoContests(vertical);
    const now = new Date().toISOString();
    for (const c of seeded) {
      await contestStore().upsert({ ...c, id: c.id, receivedAt: c.createdAt || now });
    }
    return seeded;
  }

  static async saveContest(input: Partial<Contest>): Promise<Contest> {
    const now = new Date().toISOString();
    const id = input.id || `contest-${randomUUID().slice(0, 8)}`;
    const existing = await contestStore().get(id);
    const record: StoredContestRecord = {
      ...(existing ?? {}),
      ...(input as Contest),
      id,
      createdAt: existing?.createdAt ?? input.createdAt ?? now,
      receivedAt: now,
    };
    await contestStore().upsert(record);
    return record;
  }

  static async deleteContest(id: string): Promise<boolean> {
    const removed = await contestStore().removeWhere((c) => c.id === id);
    return removed > 0;
  }
}
