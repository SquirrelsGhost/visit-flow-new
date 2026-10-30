import type { CoachProfile } from "./coachTypes";

/** Beispielprofil für die Demo-Sitzung ohne eigene Türen, damit das Briefing etwas zeigt. */
export const DEMO_COACH_PROFILE: CoachProfile = {
  doors: 412,
  met: 198,
  sales: 31,
  hitRate: 48,
  salesRate: 16,
  salesTrend: 3,
  bestWindow: { fromHour: 16, toHour: 18, hitRate: 63, averageRate: 48 },
  weakSpot: "supplied",
  topCategory: "KIP",
  rareCategory: "Mobile",
  streets: [
    { street: "Lindenstraße", open: 9 },
    { street: "Am Mühlbach", open: 6 },
    { street: "Kirchweg", open: 4 },
  ],
  streakDays: 5,
  today: { doors: 0, sales: 0 },
  learning: false,
};
