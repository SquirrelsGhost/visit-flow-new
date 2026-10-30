import type { TeamProduct, TeamUser } from "./teamTypes";

export type StructurePeriod = "day" | "week" | "month";
export type StructureLens = "structure" | "mentor";

export interface RankedMember {
  member: TeamUser;
  sales: number;
  revenue: number;
  /** Abschlüsse am Vortag (nur für den Tagesvergleich). */
  yesterday: number;
}

const startOfDay = (d: Date, shift = 0) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + shift);

/** Zeitraum wie v1: Tag, Woche ab Montag, Kalendermonat; Ende exklusiv. */
export function periodRange(period: StructurePeriod, now = new Date()): { from: Date; to: Date } {
  if (period === "day") return { from: startOfDay(now), to: startOfDay(now, 1) };
  if (period === "week") {
    const from = startOfDay(now, -((now.getDay() + 6) % 7));
    return { from, to: startOfDay(from, 7) };
  }
  return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: new Date(now.getFullYear(), now.getMonth() + 1, 1) };
}

/** Mentee nur in den ersten vier Monaten (v1 menteeUtils.isActiveMentee). */
export function isActiveMentee(user: TeamUser, mentorId: string, now = new Date()): boolean {
  if (user.mentorId !== mentorId) return false;
  const startRaw = user.vodafoneContractStart || user.mentorAssignedAt || user.createdAt;
  if (!startRaw) return !user.isRegularBerater;
  const start = new Date(startRaw);
  const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth()) + 1;
  return months < 5;
}

/** Wen die Führungskraft im Reiter sieht: ihre Gruppe (Struktur) oder ihre aktiven Mentees. */
export function peopleOf(users: readonly TeamUser[], lens: StructureLens, leadId: string, now = new Date()): TeamUser[] {
  const list = lens === "structure" ? users.filter((u) => u.strukturleiterId === leadId && u.id !== leadId) : users.filter((u) => isActiveMentee(u, leadId, now));
  return list.filter((u) => u.isActive !== false);
}

/** Wen ein Admin als Blickwinkel wählen kann. */
export function leadsFor(users: readonly TeamUser[], lens: StructureLens): TeamUser[] {
  return users.filter((u) => (lens === "structure" ? u.role === "strukturleiter" : u.role === "mentor"));
}

/** Rangliste im Zeitraum, nach Abschlüssen absteigend (v1 handleGenerateReport). */
export function rankMembers(members: readonly TeamUser[], products: readonly TeamProduct[], period: StructurePeriod, now = new Date()): RankedMember[] {
  const { from, to } = periodRange(period, now);
  const yFrom = startOfDay(now, -1).getTime();
  const yTo = startOfDay(now).getTime();
  const byId = new Map(members.map((m) => [m.id, { member: m, sales: 0, revenue: 0, yesterday: 0 }]));
  for (const p of products) {
    const entry = byId.get(p.userId);
    if (!entry) continue;
    const t = new Date(p.timestamp).getTime();
    const qty = p.quantity ?? 1;
    if (t >= from.getTime() && t < to.getTime()) {
      entry.sales += qty;
      entry.revenue += p.commissionEuro ?? 0;
    }
    if (t >= yFrom && t < yTo) entry.yesterday += qty;
  }
  return [...byId.values()].sort((a, b) => b.sales - a.sales || a.member.name.localeCompare(b.member.name, "de"));
}

/** Ab so vielen Abschlüssen gilt jemand als Top Performer (v1). */
export const TOP_THRESHOLD: Record<StructurePeriod, number> = { day: 5, week: 20, month: 60 };
