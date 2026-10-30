import type { Vertical } from "../battle/battleCategories";
import { groupOrders, monthCounts, statusOf, verticalOf } from "../crm/crmLogic";
import type { SaleRecord } from "../crm/crmTypes";
import { localDay } from "../overview/todayStats";
import type { OrgDirectory } from "../teams/orgTypes";
import type { AdminActivity, AdminDay, AdminFigures, AdminProduct, TeamRank } from "./adminTypes";

/** Tage im Verlauf (heute eingeschlossen). */
export const TREND_DAYS = 14;

const dayOffset = (now: Date, back: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() - back);
  return localDay(d);
};

/** Erster Tag, ab dem geladen wird: Monatsanfang oder Beginn des Verlaufs, je nachdem was früher liegt. */
export function loadStart(now = new Date()): Date {
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const trendStart = new Date(now);
  trendStart.setDate(trendStart.getDate() - (TREND_DAYS - 1));
  trendStart.setHours(0, 0, 0, 0);
  return monthStart < trendStart ? monthStart : trendStart;
}

/** Produkte als Auftragszeilen, damit Aufträge und Stornoquote genauso zählen wie auf der Seite Aufträge. */
const asSales = (products: readonly AdminProduct[]): SaleRecord[] =>
  products.map((p, i) => ({ id: `${p.doorId}-${i}`, doorId: p.doorId, category: p.category, type: p.type, quantity: 1, timestamp: p.timestamp, notes: p.notes, commissionEuro: p.commissionEuro, customerName: "", address: "" }));

const live = (p: AdminProduct) => statusOf(p.notes) !== "cancelled";

function rankTeams(directory: OrgDirectory, sold: readonly AdminProduct[], month: string, today: string): TeamRank[] {
  const teamOf = new Map(directory.users.map((u) => [u.id, u.teamId]));
  const ranks = new Map<string, TeamRank>(directory.teams.map((t) => [t.id, { id: t.id, name: t.name, salesMonth: 0, salesToday: 0, people: 0 }]));
  for (const u of directory.users) {
    const rank = u.teamId ? ranks.get(u.teamId) : undefined;
    if (rank && u.isActive !== false && !u.isBlocked) rank.people += 1;
  }
  for (const p of sold) {
    const rank = ranks.get(teamOf.get(p.userId) ?? "");
    const day = localDay(p.timestamp);
    if (!rank || !day.startsWith(month)) continue;
    rank.salesMonth += 1;
    if (day === today) rank.salesToday += 1;
  }
  return [...ranks.values()].sort((a, b) => b.salesMonth - a.salesMonth || b.salesToday - a.salesToday || a.name.localeCompare(b.name, "de"));
}

/** Kennzahlen des Dashboards: heute, Verlauf, Monat und Stornoquote in der Sparte, dazu alle Sparten im Vergleich. */
export function adminFigures(directory: OrgDirectory, activity: AdminActivity, vertical: Vertical, now = new Date()): AdminFigures {
  const today = localDay(now);
  const yesterday = dayOffset(now, 1);
  const month = today.slice(0, 7);
  const inVertical = activity.products.filter((p) => verticalOf(p.category) === vertical);
  const sold = inVertical.filter(live);

  const salesByDay = new Map<string, number>();
  for (const p of sold) salesByDay.set(localDay(p.timestamp), (salesByDay.get(localDay(p.timestamp)) ?? 0) + 1);
  const doorsByDay = new Map<string, number>();
  for (const d of activity.doors) doorsByDay.set(localDay(d.timestamp), (doorsByDay.get(localDay(d.timestamp)) ?? 0) + 1);
  const days: AdminDay[] = Array.from({ length: TREND_DAYS }, (_, i) => {
    const date = dayOffset(now, TREND_DAYS - 1 - i);
    return { date, sales: salesByDay.get(date) ?? 0, doors: doorsByDay.get(date) ?? 0 };
  });

  const byVertical: Record<Vertical, number> = { telco: 0, energy: 0, solar: 0 };
  for (const p of activity.products) if (live(p) && localDay(p.timestamp).startsWith(month)) byVertical[verticalOf(p.category)] += 1;

  const active = new Set<string>();
  for (const d of activity.doors) if (localDay(d.timestamp) === today) active.add(d.userId);
  for (const p of activity.products) if (localDay(p.timestamp) === today) active.add(p.userId);

  const salesToday = salesByDay.get(today) ?? 0;
  const doorsToday = doorsByDay.get(today) ?? 0;
  return {
    salesToday,
    salesYesterday: salesByDay.get(yesterday) ?? 0,
    doorsToday,
    activeToday: active.size,
    conversion: doorsToday > 0 ? Math.round((salesToday / doorsToday) * 100) : 0,
    month: monthCounts(groupOrders(asSales(inVertical), now.getTime()), now),
    days,
    byVertical,
    teams: rankTeams(directory, sold, month, today),
  };
}
