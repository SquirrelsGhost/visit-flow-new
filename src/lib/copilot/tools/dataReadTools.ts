import { loadSnapshot } from "../../battle/battleApi";
import { involves, isLiveBattle, streakValue } from "../../battle/battleSelectors";
import { loadSales } from "../../crm/crmApi";
import { groupOrders, monthCounts, ordersOfVertical, salesToRecover, STORNO_LIMIT, stornoBuffer } from "../../crm/crmLogic";
import { loadExpiring } from "../../expiring/expiringApi";
import { readPreference } from "../../preferences";
import { effectiveStatus } from "../../team/dailyStatus";
import { loadTeamMembers } from "../../team/teamApi";
import { num, type ToolArgs, type ToolContext } from "./copilotToolTypes";

const round = (n: number) => Math.round(n * 10) / 10;
const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? "";

/** Aufträge der Sparte im Zeitraum: Zahlen und häufigste Produkte, keine Kunden. */
export async function getOrders(args: ToolArgs, ctx: ToolContext) {
  const days = [7, 30, 90].includes(num(args, "days") ?? 0) ? (num(args, "days") as number) : 30;
  const orders = groupOrders(ordersOfVertical(await loadSales(), ctx.vertical), ctx.now).filter((o) => o.daysSince < days);
  const products = new Map<string, number>();
  for (const order of orders) for (const p of order.products) products.set(p.type, (products.get(p.type) ?? 0) + p.quantity);
  const cancelled = orders.filter((o) => o.status === "cancelled").length;
  return {
    days,
    orders: orders.length,
    open: orders.filter((o) => o.status === "open").length,
    completed: orders.filter((o) => o.status === "completed").length,
    cancelled,
    stornoRate: orders.length > 0 ? round((cancelled / orders.length) * 100) : null,
    topProducts: [...products].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([type, count]) => ({ type, count })),
  };
}

/** Monatsziel aus dem Simulator (localStorage "provisionGoal" wie v1). */
function savedGoal(): number | null {
  try {
    const saved = JSON.parse(readPreference("provisionGoal") ?? "null") as { targetTotal?: number } | null;
    return typeof saved?.targetTotal === "number" ? saved.targetTotal : null;
  } catch {
    return null;
  }
}

/** Provision des Monats aus den Aufträgen, Storno-Puffer bis zum Bonus und das gespeicherte Ziel. */
export async function getEarnings(ctx: ToolContext) {
  const month = monthCounts(groupOrders(ordersOfVertical(await loadSales(), ctx.vertical), ctx.now), new Date(ctx.now));
  return {
    commissionThisMonth: Math.round(month.commission),
    salesThisMonth: month.sales,
    stornoRate: month.quote === null ? null : round(month.quote),
    stornoLimit: STORNO_LIMIT,
    stornosLeftBeforeLimit: stornoBuffer(month),
    salesNeededToRecover: salesToRecover(month),
    monthlyGoal: savedGoal(),
  };
}

/** Auslaufende Verträge je Woche; Berater sehen nur die eigenen. */
export async function getExpiring(args: ToolArgs, ctx: ToolContext) {
  const weeks = Math.min(12, Math.max(1, num(args, "weeks") ?? 4));
  const own = (await loadExpiring()).filter((c) => ctx.user?.role !== "berater" || c.userId === ctx.user.id);
  const inWindow = own.filter((c) => c.daysLeft <= weeks * 7);
  const perWeek = Array.from({ length: weeks }, (_, i) => inWindow.filter((c) => Math.floor(c.daysLeft / 7) === i).length);
  const next = [...inWindow].sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 5).map((c) => ({ product: c.type, daysLeft: c.daysLeft, city: c.city }));
  return { total: inWindow.length, perWeek, next, commission: Math.round(inWindow.reduce((n, c) => n + c.commissionEuro, 0)) };
}

/** Battle-Stand des Nutzers. */
export async function getBattle(ctx: ToolContext) {
  const snap = await loadSnapshot(ctx.vertical);
  const me = ctx.user?.id;
  const live = snap.activeBattles.filter((c) => isLiveBattle(c) && involves(c, me));
  const won = snap.completedBattles.filter((c) => c.winnerId === me).length;
  const lost = snap.completedBattles.filter((c) => involves(c, me) && c.winnerId && c.winnerId !== me).length;
  return {
    running: live.map((c) => {
      const mine = c.challengerId === me;
      return { opponent: firstName(mine ? c.opponentName : c.challengerName), myScore: mine ? c.challengerScore : c.opponentScore, theirScore: mine ? c.opponentScore : c.challengerScore };
    }),
    openChallenges: snap.myChallenges.filter((c) => c.status === "pending").length,
    won,
    lost,
    streak: me ? streakValue(snap.streaks, me) : 0,
    topEarnerRank: snap.topEarners.find((e) => e.userId === me)?.rank ?? null,
  };
}

/** Team heute für Führungskräfte: Vorname, Tagesstatus, Anwesenheit. */
export async function getTeamToday(ctx: ToolContext) {
  const members = (await loadTeamMembers()) ?? [];
  const ref = new Date(ctx.now);
  const team = members.filter((m) => m.isActive !== false && m.id !== ctx.user?.id);
  return {
    members: team.slice(0, 30).map((m) => ({ name: firstName(m.name), status: effectiveStatus(m, ref), attendance: m.dailyAttendance ?? null })),
    sick: team.filter((m) => effectiveStatus(m, ref) === "sick").length,
  };
}
