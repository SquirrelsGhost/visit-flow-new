import type { Challenge, MeMetrics } from "./meTypes";

const HOUR = 3_600_000;

/** Ende des heutigen Tages bzw. der Woche (Sonntag 23:59), damit die Countdowns echt laufen. */
function endOfDay(now: Date): string {
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  return end.toISOString();
}

function endOfWeek(now: Date): string {
  const end = new Date(now);
  end.setDate(end.getDate() + ((7 - end.getDay()) % 7));
  end.setHours(23, 59, 59, 999);
  return end.toISOString();
}

function demoChallenges(now: Date): Challenge[] {
  const day = endOfDay(now);
  const week = endOfWeek(now);
  return [
    { id: "d1", type: "daily", name: "Türöffner", description: "Klingle heute an 40 Türen", category: "doors", difficulty: "easy", current: 34, target: 40, xp: 50, endsAt: day, completed: false },
    { id: "d2", type: "daily", name: "Abschluss-Profi", description: "Schließe heute 3 Verträge ab", category: "sales", difficulty: "medium", current: 1, target: 3, xp: 120, bonusXp: 40, endsAt: day, completed: false },
    { id: "d3", type: "daily", name: "Frühstarter", description: "Erster Besuch vor 10 Uhr", category: "performance", difficulty: "easy", current: 1, target: 1, xp: 30, endsAt: day, completed: true, bonusEarned: true },
    { id: "w1", type: "weekly", name: "Wochen-Marathon", description: "200 Besuche in dieser Woche", category: "doors", difficulty: "hard", current: 128, target: 200, xp: 400, endsAt: week, completed: false },
    { id: "w2", type: "weekly", name: "Kombi-König", description: "5 GigaKombi-Verträge diese Woche", category: "mixed", difficulty: "extreme", current: 4, target: 5, xp: 600, bonusXp: 150, endsAt: new Date(now.getTime() + 30 * HOUR).toISOString(), completed: false },
  ];
}

/** Beispielzahlen für den Demo-Admin: zeigen jede Karte des Reiters "Ich" mit sinnvollen Werten. */
export function demoMeMetrics(now = new Date()): MeMetrics {
  return {
    todayRevenue: 245,
    weekRevenue: 1180,
    monthRevenue: 3420,
    todaySales: 2,
    todayVisits: 34,
    weekVisits: 128,
    dailyTarget: 40,
    weeklyTarget: 200,
    pointRelevantSales: 9,
    workDays: 4,
    dailySalesGoals: { KIP: 2, Mobile: 1, "Giga TV": 1 },
    todaySalesByCategory: { KIP: 1, Mobile: 1 },
    weekSalesByCategory: { KIP: 6, Mobile: 3, "Giga TV": 2 },
    contractMonth: 7,
    monthlyLeads: 64,
    bonusCounts: { kip: 14, "kip-upsell": 6, gigatv: 9, mobile: 11, "regulaer-bonus": 18, stornoquote: 1 },
    challenges: demoChallenges(now),
    monthGoal: {
      targetTotal: 6000,
      products: [
        { name: "Internet & Phone", category: "KIP", quantity: 24 },
        { name: "GigaTV", category: "GigaTV", quantity: 10 },
        { name: "Mobilfunk", category: "Mobile", quantity: 14 },
        { name: "Upsell", category: "Upsell", quantity: 8 },
      ],
    },
    conversion: { rate: 0.08, isPersonalized: true },
  };
}
