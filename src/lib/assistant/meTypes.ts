/** Farbe einer Ziel-Ansicht; bestimmt Verlauf, Zahl und Balken (v1 SwipeableGoalCard). */
export type GoalTone = "purple" | "indigo" | "red" | "blue" | "green" | "orange" | "pink" | "gray";

export interface GoalView {
  id: string;
  label: string;
  /** Produktkategorie; ohne Kategorie zählt die Ansicht Besuche. */
  category?: string;
  current: number;
  target: number;
  tone: GoalTone;
}

export interface BonusTier {
  stufe: number;
  target: number;
  bonusAmount: number;
  perProduct?: boolean;
}

export type BonusIcon = "wifi" | "wifi-tv" | "smartphone" | "tv" | "trending-up" | "award" | "shield-check";

export interface BonusCategory {
  id: string;
  name: string;
  icon: BonusIcon;
  gradient: string;
  tiers: readonly BonusTier[];
}

export type ChallengeDifficulty = "easy" | "medium" | "hard" | "extreme";

export interface Challenge {
  id: string;
  type: "daily" | "weekly";
  name: string;
  description: string;
  category: "doors" | "sales" | "performance" | "mixed";
  difficulty: ChallengeDifficulty;
  current: number;
  target: number;
  xp: number;
  bonusXp?: number;
  endsAt: string;
  completed: boolean;
  bonusEarned?: boolean;
}

export interface MonthGoalProduct {
  name: string;
  category: string;
  quantity: number;
}

/** Monatsziel aus dem Provisionsrechner (v1 localStorage "provisionGoal"). */
export interface MonthGoal {
  targetTotal: number;
  products: readonly MonthGoalProduct[];
}

/** Alles, was der Reiter "Ich" anzeigt (v1 MetricsService + Kontexte, hier als ein Paket). */
export interface MeMetrics {
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  todaySales: number;
  todayVisits: number;
  weekVisits: number;
  dailyTarget: number;
  weeklyTarget: number;
  pointRelevantSales: number;
  workDays: number;
  dailySalesGoals: Readonly<Record<string, number>>;
  todaySalesByCategory: Readonly<Record<string, number>>;
  weekSalesByCategory: Readonly<Record<string, number>>;
  contractMonth: number;
  /** Nicht stornierte Solar-Leads im laufenden Monat (v1 monthlySolarCount). */
  monthlyLeads: number;
  bonusCounts: Readonly<Record<string, number>>;
  challenges: readonly Challenge[];
  monthGoal: MonthGoal | null;
  conversion: { rate: number; isPersonalized: boolean };
}
