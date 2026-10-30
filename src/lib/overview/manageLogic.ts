import { effectiveDailyStatus, type DailyStatusValue } from "./dailyStatus";
import type { TeamData, TeamUser } from "./teamTypes";
import { localDay } from "./todayStats";

/** Zahlen eines Mitglieds für Liste und Detail (v1 memberStats in TeamleiterVerwaltung). */
export interface MemberStats {
  doorsToday: number;
  salesToday: number;
  salesMonth: number;
  pointsMonth: number;
  /** Abschlüsse je Tür heute, 0 bis 100. */
  conversion: number;
}

export type ManageFilter = "all" | "groups" | "unassigned" | "out" | "leads";

export interface StrukturGroup {
  leader: TeamUser;
  members: TeamUser[];
}

const EMPTY: MemberStats = { doorsToday: 0, salesToday: 0, salesMonth: 0, pointsMonth: 0, conversion: 0 };
const LEADS = new Set(["strukturleiter", "mentor", "teamleiter", "admin"]);

/** Heute und im laufenden Monat, pro Mitglied. */
export function memberStats(data: TeamData, now = new Date()): Map<string, MemberStats> {
  const today = localDay(now);
  const month = today.slice(0, 7);
  const map = new Map<string, MemberStats>();
  const get = (id: string) => map.get(id) ?? (map.set(id, { ...EMPTY }), map.get(id)!);
  for (const p of data.products) {
    const day = localDay(p.timestamp);
    if (!day.startsWith(month)) continue;
    const s = get(p.userId);
    const qty = p.quantity ?? 1;
    s.salesMonth += qty;
    if (p.isPointRelevant) s.pointsMonth += qty;
    if (day === today) s.salesToday += qty;
  }
  for (const d of data.doors) if (localDay(d.timestamp) === today) get(d.userId).doorsToday += 1;
  for (const s of map.values()) s.conversion = s.doorsToday > 0 ? Math.round((s.salesToday / s.doorsToday) * 100) : 0;
  return map;
}

export const statsOf = (stats: Map<string, MemberStats>, id: string): MemberStats => stats.get(id) ?? EMPTY;

/** Rollenname wie v1; in Lead heißen Strukturleiter "Teamleiter", Mentoren "Ausbilder", Teamleiter "Partner". */
export function roleLabel(role: string, solar: boolean): string {
  const base: Record<string, string> = { admin: "Admin", gebietsmanager: "Gebietsmanager", teamleiter: "Teamleiter", strukturleiter: "Strukturleiter", mentor: "Mentor", berater: "Berater" };
  if (solar && role === "strukturleiter") return "Teamleiter";
  if (solar && role === "mentor") return "Ausbilder";
  if (solar && role === "teamleiter") return "Partner";
  return base[role] ?? "Berater";
}

/** Strukturleiter-Gruppen in fester Reihenfolge (v1 team_group_order), dazu wer keiner Gruppe angehört. */
export function strukturGroups(users: readonly TeamUser[]): { groups: StrukturGroup[]; unassigned: TeamUser[] } {
  const leaders = users.filter((u) => u.role === "strukturleiter");
  const ids = new Set(leaders.map((l) => l.id));
  const groups = leaders.map((leader) => ({ leader, members: users.filter((u) => u.strukturleiterId === leader.id && u.id !== leader.id) }));
  const unassigned = users.filter((u) => !ids.has(u.id) && !(u.strukturleiterId && ids.has(u.strukturleiterId)) && u.role !== "teamleiter" && u.role !== "admin");
  return { groups, unassigned };
}

export const statusOf = (user: TeamUser, now = new Date()): DailyStatusValue => effectiveDailyStatus(user, now);

/** Suche und Filter der Teamliste; sortiert nach Abschlüssen heute, dann im Monat. */
export function filterMembers(users: readonly TeamUser[], filter: ManageFilter, query: string, stats: Map<string, MemberStats>, now = new Date()): TeamUser[] {
  const q = query.trim().toLowerCase();
  const { unassigned } = strukturGroups(users);
  const loose = new Set(unassigned.map((u) => u.id));
  return users
    .filter((u) => !q || u.name.toLowerCase().includes(q) || (u.email ?? "").toLowerCase().includes(q))
    .filter((u) => {
      if (filter === "unassigned") return loose.has(u.id);
      if (filter === "out") return statusOf(u, now) === "sick" || statusOf(u, now) === "inactive" || u.isActive === false;
      if (filter === "leads") return LEADS.has(u.role);
      return true;
    })
    .sort((a, b) => {
      const sa = statsOf(stats, a.id);
      const sb = statsOf(stats, b.id);
      return sb.salesToday - sa.salesToday || sb.salesMonth - sa.salesMonth || a.name.localeCompare(b.name, "de");
    });
}

export interface TeamPulse {
  members: number;
  working: number;
  out: number;
  doorsToday: number;
  salesToday: number;
  salesMonth: number;
  conversion: number;
  noSales: TeamUser[];
  topToday: TeamUser[];
  absent: TeamUser[];
}

/** Kopfzahlen und Hinweise (v1 quickStats und alerts): wer heute fehlt, wer noch nichts hat, wer glänzt. */
export function teamPulse(users: readonly TeamUser[], stats: Map<string, MemberStats>, now = new Date()): TeamPulse {
  const active = users.filter((u) => u.isActive !== false);
  const absent = active.filter((u) => statusOf(u, now) === "sick" || statusOf(u, now) === "inactive");
  const working = active.filter((u) => !absent.includes(u));
  const sum = (key: keyof MemberStats) => active.reduce((total, u) => total + statsOf(stats, u.id)[key], 0);
  const doorsToday = sum("doorsToday");
  const salesToday = sum("salesToday");
  const field = working.filter((u) => u.role !== "teamleiter" && u.role !== "admin");
  return {
    members: active.length,
    working: working.length,
    out: absent.length,
    doorsToday,
    salesToday,
    salesMonth: sum("salesMonth"),
    conversion: doorsToday > 0 ? Math.round((salesToday / doorsToday) * 100) : 0,
    noSales: field.filter((u) => statsOf(stats, u.id).salesToday === 0),
    topToday: field.filter((u) => statsOf(stats, u.id).salesToday >= 3).sort((a, b) => statsOf(stats, b.id).salesToday - statsOf(stats, a.id).salesToday),
    absent,
  };
}

/** Wählbare Mentoren und Strukturleiter für die Zuordnung eines Mitglieds. */
export function assignable(users: readonly TeamUser[], memberId: string) {
  const others = users.filter((u) => u.id !== memberId && u.isActive !== false);
  return { leaders: others.filter((u) => u.role === "strukturleiter"), mentors: others.filter((u) => u.role === "mentor" || u.role === "strukturleiter") };
}
