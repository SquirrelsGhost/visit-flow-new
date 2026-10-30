import type { MeMetrics, MonthGoal } from "./meTypes";

export type PaceTone = "green" | "blue" | "amber" | "red";
export type PaceKind = "reached" | "ahead" | "onTrack" | "behind" | "push";

export interface MonthGoalPlan {
  progress: number;
  remaining: number;
  remainingWorkDays: number;
  dailyNeeded: number;
  dailySalesNeeded: number;
  doorsPerDay: number;
  pace: { kind: PaceKind; tone: PaceTone };
}

/** Arbeitstage (Mo–Fr) im Monat und wie viele davon nach heute noch kommen. */
export function workDays(now: Date): { total: number; remaining: number } {
  const year = now.getFullYear();
  const month = now.getMonth();
  const days = new Date(year, month + 1, 0).getDate();
  let total = 0;
  let remaining = 0;
  for (let d = 1; d <= days; d++) {
    const weekday = new Date(year, month, d).getDay();
    if (weekday < 1 || weekday > 5) continue;
    total++;
    if (d > now.getDate()) remaining++;
  }
  return { total, remaining };
}

function paceOf(progress: number, expected: number): MonthGoalPlan["pace"] {
  const diff = progress - expected;
  if (progress >= 100) return { kind: "reached", tone: "green" };
  if (diff >= 10) return { kind: "ahead", tone: "green" };
  if (diff >= -5) return { kind: "onTrack", tone: "blue" };
  if (diff >= -20) return { kind: "behind", tone: "amber" };
  return { kind: "push", tone: "red" };
}

/** Rechnet das Monatsziel durch wie v1 (DashboardTab, Abschnitt "Monatsziel"). */
export function planMonthGoal(goal: MonthGoal, monthRevenue: number, conversion: MeMetrics["conversion"], now: Date): MonthGoalPlan {
  const days = workDays(now);
  const progress = goal.targetTotal > 0 ? Math.min(100, (monthRevenue / goal.targetTotal) * 100) : 0;
  const remaining = Math.max(0, goal.targetTotal - monthRevenue);
  const dailyNeeded = days.remaining > 0 ? remaining / days.remaining : remaining;
  const units = goal.products.reduce((sum, p) => sum + p.quantity, 0);
  const dailySalesNeeded = units > 0 ? dailyNeeded / (goal.targetTotal / units) : 1;
  const doorsPerDay = Math.ceil(dailySalesNeeded / Math.max(conversion.rate, 0.01));
  const elapsed = days.total - days.remaining;
  const expected = elapsed > 0 ? (elapsed / days.total) * 100 : 0;
  return { progress, remaining, remainingWorkDays: days.remaining, dailyNeeded, dailySalesNeeded, doorsPerDay, pace: paceOf(progress, expected) };
}
