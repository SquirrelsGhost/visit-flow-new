import type { Contest, ContestScope, ContestStanding, GoalProgress } from "./contestTypes";
import type { TeamProduct, TeamUser } from "./teamTypes";

const DAY = 86_400_000;

const endOfDay = (iso: string) => {
  const d = new Date(iso);
  d.setHours(23, 59, 59, 999);
  return d;
};

const startOfDay = (d: Date, back = 0) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - back);

/** Laufende und geplante Gewinnspiele, die den Nutzer betreffen (v1 computeActiveContests). */
export function contestsForUser(contests: readonly Contest[], user: { id: string; teamId?: string }, now = new Date()): Contest[] {
  return contests.filter((c) => {
    if (c.status !== "active" && c.status !== "planned") return false;
    if (now > endOfDay(c.endDate)) return false;
    const teamScoped = !c.scope || c.scope === "team";
    if (teamScoped && c.teamId === user.teamId) return true;
    return Boolean(c.selectedUserIds?.includes(user.id) || c.createdBy === user.id);
  });
}

/** Gewinnspiele je Bereich (Haupt, Strukturleiter, Mentor); nur Bereiche mit Einträgen. */
export function contestsByScope(contests: readonly Contest[]): { scope: ContestScope; contests: Contest[] }[] {
  const order: ContestScope[] = ["team", "strukturleiter", "mentor"];
  return order
    .map((scope) => ({ scope, contests: contests.filter((c) => (c.scope ?? "team") === scope) }))
    .filter((group) => group.contests.length > 0);
}

/** Wer mitspielt: Bereichs-Gewinnspiele über die Auswahl, sonst nach Art; ohne Inaktive und Battle-Ausgeschlossene. */
export function eligibleUsers(contest: Contest, users: readonly TeamUser[]): TeamUser[] {
  const scoped = contest.scope === "mentor" || contest.scope === "strukturleiter";
  let list: TeamUser[];
  if (scoped && contest.selectedUserIds?.length) list = users.filter((u) => contest.selectedUserIds?.includes(u.id));
  else if (contest.type === "all") list = users.filter((u) => u.teamId === contest.teamId);
  else if (contest.type === "individual") list = users.filter((u) => contest.selectedUserIds?.includes(u.id));
  else if (contest.type === "groups") list = users.filter((u) => u.strukturleiterId && contest.strukturleiterIds?.includes(u.strukturleiterId));
  else list = [];
  return list.filter((u) => u.isActive !== false && u.battleInactive !== true);
}

function goalProgress(contest: Contest, products: readonly TeamProduct[], userIds: ReadonlySet<string>, now: Date): GoalProgress[] {
  const start = new Date(contest.startDate).getTime();
  const end = endOfDay(contest.endDate).getTime();
  const today = startOfDay(now).getTime();
  const yesterday = startOfDay(now, 1).getTime();
  const own = products.filter((p) => {
    const t = new Date(p.timestamp).getTime();
    return userIds.has(p.userId) && t >= start && t <= end;
  });
  return contest.goals.map((goal) => {
    let current = 0;
    let todayCount = 0;
    let yesterdayCount = 0;
    for (const p of own) {
      if (p.category !== goal.category) continue;
      const qty = p.quantity ?? 1;
      const t = new Date(p.timestamp).getTime();
      current += qty;
      if (t >= today && t < today + DAY) todayCount += qty;
      else if (t >= yesterday && t < today) yesterdayCount += qty;
    }
    return { category: goal.category, current, target: goal.target, today: todayCount, yesterday: yesterdayCount };
  });
}

const progressOf = (goals: GoalProgress[]) =>
  goals.length === 0 ? 0 : goals.reduce((sum, g) => sum + Math.min(g.target > 0 ? (g.current / g.target) * 100 : 0, 100), 0) / goals.length;

/** Rangliste wie v1: nach Zielerreichung, bei Gleichstand nach Stückzahl. */
export function contestStandings(contest: Contest, users: readonly TeamUser[], products: readonly TeamProduct[], now = new Date()): ContestStanding[] {
  const entries =
    contest.type === "custom-groups" && contest.customGroups
      ? contest.customGroups.map((group) => {
          const members = users.filter((u) => group.memberIds.includes(u.id) && u.isActive !== false && u.battleInactive !== true);
          return { id: group.id, name: group.name, ids: new Set(members.map((m) => m.id)), memberNames: members.map((m) => m.name) };
        })
      : eligibleUsers(contest, users).map((u) => ({ id: u.id, name: u.name, ids: new Set([u.id]), memberNames: [] as string[] }));
  const standings = entries.map((entry) => {
    const goals = goalProgress(contest, products, entry.ids, now);
    return { id: entry.id, name: entry.name, goals, progress: progressOf(goals), rank: 0, qualified: contest.contestType === "qualification" && goals.every((g) => g.current >= g.target), memberNames: entry.memberNames };
  });
  const units = (s: ContestStanding) => s.goals.reduce((sum, g) => sum + g.current, 0);
  standings.sort((a, b) => b.progress - a.progress || units(b) - units(a));
  standings.forEach((s, i) => (s.rank = i + 1));
  return standings;
}

/** Für eigene Gruppen die Gruppe des Nutzers, sonst seine id. */
export function ownStandingId(contest: Contest, userId: string): string {
  if (contest.type !== "custom-groups") return userId;
  return contest.customGroups?.find((g) => g.memberIds.includes(userId))?.id ?? userId;
}

export interface ContestClock {
  started: boolean;
  /** Bis zum Start; nur vor dem Start. */
  countdown: { days: number; hours: number; minutes: number; seconds: number } | null;
  /** Anteil der verstrichenen Zeit 0 bis 100. */
  timeShare: number;
  daysLeft: number;
}

export function contestClock(contest: Contest, now = new Date()): ContestClock {
  const start = new Date(contest.startDate).getTime();
  const end = new Date(contest.endDate).getTime();
  const started = start <= now.getTime();
  const left = Math.max(0, Math.floor((start - now.getTime()) / 1000));
  return {
    started,
    countdown: started ? null : { days: Math.floor(left / 86400), hours: Math.floor(left / 3600) % 24, minutes: Math.floor(left / 60) % 60, seconds: left % 60 },
    timeShare: started && end > start ? Math.min(100, Math.max(0, ((now.getTime() - start) / (end - start)) * 100)) : 0,
    daysLeft: Math.max(0, Math.floor((end - now.getTime()) / DAY)),
  };
}
