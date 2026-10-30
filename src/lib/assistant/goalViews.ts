import type { GoalTone, GoalView, MeMetrics } from "./meTypes";

const CATEGORY_TONES: Record<string, GoalTone> = {
  KIP: "red",
  Glasfaser: "blue",
  Mobile: "green",
  "Giga TV": "purple",
  KAS: "orange",
  Upsell: "pink",
};

/** Tagesziele: zuerst Besuche, dann je Produktkategorie mit eigenem Tagesziel (v1 DashboardTab). */
export function dailyViews(m: MeMetrics, label: string): GoalView[] {
  const views: GoalView[] = [{ id: "visits", label, current: m.todayVisits, target: m.dailyTarget, tone: "purple" }];
  for (const [category, target] of Object.entries(m.dailySalesGoals)) {
    if (target > 0) {
      const current = m.todaySalesByCategory[category] ?? 0;
      views.push({ id: `today-${category}`, label, category, current, target, tone: CATEGORY_TONES[category] ?? "gray" });
    }
  }
  return views;
}

/** Wochenziele: Besuche und Tagesziele mal fünf Arbeitstage. */
export function weeklyViews(m: MeMetrics, label: string): GoalView[] {
  const views: GoalView[] = [{ id: "week-visits", label, current: m.weekVisits, target: m.weeklyTarget, tone: "indigo" }];
  for (const [category, daily] of Object.entries(m.dailySalesGoals)) {
    if (daily > 0) {
      const current = m.weekSalesByCategory[category] ?? 0;
      views.push({ id: `week-${category}`, label, category, current, target: daily * 5, tone: CATEGORY_TONES[category] ?? "gray" });
    }
  }
  return views;
}
