import { ASSIGNABLE_ROLES } from "./battleCategories";
import type { ArenaUser, Challenge, Readiness, StreakMap, TeamMember } from "./battleTypes";
import type { DayStats } from "./arenaScore";

/** Abgeleitete Listen der Arena, rein und ohne React, damit sie testbar bleiben. */
export const isLiveBattle = (c: Challenge) => c.status === "accepted" || c.status === "active";

export const involves = (c: Challenge, userId: string | undefined) =>
  !!userId && (c.challengerId === userId || c.opponentId === userId);

/** true, wenn die Person heute in irgendeinem laufenden Battle steckt (teamweit). */
export const isInBattle = (battles: Challenge[], userId: string) =>
  battles.some((c) => isLiveBattle(c) && involves(c, userId));

/** Nur battlefähige Personen aus battle-readiness, ohne Kranke, Inaktive, Admins und mich selbst. */
export function eligibleMembers(
  readiness: Readiness,
  users: ArenaUser[],
  meId: string,
  statsOf: (id: string) => DayStats,
): TeamMember[] {
  const eligible = new Map<string, Omit<TeamMember, "userId" | "totalSales">>();
  for (const b of readiness.newcomers) eligible.set(b.userId, { category: "newcomer", month: b.month, name: b.name || "Anonym" });
  for (const b of readiness.experienced) eligible.set(b.userId, { category: "experienced", month: b.month, name: b.name || "Anonym" });
  eligible.delete(meId);
  for (const b of readiness.sickToday) eligible.delete(b.userId);
  for (const u of users) if (u.battleInactive || u.isActive === false || u.role === "admin") eligible.delete(u.id);
  return [...eligible].map(([userId, info]) => ({ userId, ...info, totalSales: statsOf(userId).sales }));
}

/** Siegesserie positiv, Niederlagenserie negativ. */
export const streakValue = (streaks: StreakMap, id: string) =>
  streaks[id]?.streak ? streaks[id].streak : streaks[id]?.loseStreak ? -streaks[id].loseStreak : 0;

/** Wer schon im Battle ist, rutscht nach unten; sonst Siegesserien oben, Niederlagenserien unten. */
export function sortMembers(members: TeamMember[], battles: Challenge[], streaks: StreakMap): TeamMember[] {
  return [...members].sort((a, b) => {
    const active = Number(isInBattle(battles, a.userId)) - Number(isInBattle(battles, b.userId));
    return active || streakValue(streaks, b.userId) - streakValue(streaks, a.userId);
  });
}

/** Eigenes Battle zuerst, danach die mit den meisten Punkten. */
export function sortActiveBattles(battles: Challenge[], meId: string | undefined, scoreOf: (id: string) => number) {
  return [...battles].sort((a, b) => {
    const mine = Number(!involves(a, meId)) - Number(!involves(b, meId));
    const total = (c: Challenge) => scoreOf(c.challengerId) + scoreOf(c.opponentId);
    return mine || total(b) - total(a);
  });
}

export interface PlayerGroups {
  available: ArenaUser[];
  inBattle: ArenaUser[];
  unavailable: ArenaUser[];
}

/** Auswahl für die manuelle Zuweisung: Verfügbar, Bereits im Battle, Nicht verfügbar. */
export function playerGroups(users: ArenaUser[], excludeId: string, battles: Challenge[], readiness: Readiness): PlayerGroups {
  const byName = (a: ArenaUser, b: ArenaUser) => a.name.localeCompare(b.name);
  const valid = users.filter((u) => (ASSIGNABLE_ROLES as readonly string[]).includes(u.role) && u.id !== excludeId);
  const blocked = (u: ArenaUser) =>
    u.isActive === false ||
    u.battleInactive === true ||
    readiness.sickToday.some((s) => s.userId === u.id) ||
    readiness.inactive.some((s) => s.userId === u.id);
  const fighting = (u: ArenaUser) => isInBattle(battles, u.id);
  return {
    available: valid.filter((u) => !fighting(u) && !blocked(u)).sort(byName),
    inBattle: valid.filter(fighting).sort(byName),
    unavailable: valid.filter((u) => !fighting(u) && blocked(u)).sort(byName),
  };
}
