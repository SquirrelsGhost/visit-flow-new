import type { ArenaProduct } from "./arenaScore";

/** Typen der Battle Arena, Felder wie die v1-API (/api/challenges/*) sie liefert. */
export type ChallengeStatus = "pending" | "accepted" | "declined" | "active" | "completed" | "expired" | "cancelled_sick";

export interface Challenge {
  id: string;
  challengerId: string;
  challengerName: string;
  opponentId: string;
  opponentName: string;
  status: ChallengeStatus;
  challengerScore: number;
  opponentScore: number;
  date: string;
  createdAt: string;
  expiresAt: string;
  winnerId?: string;
  completedAt?: string;
  isAutoAssigned?: boolean;
}

export interface ReadinessEntry {
  userId: string;
  name: string;
  month: number | null;
}

export interface InactiveBerater extends ReadinessEntry {
  hasBattleToday: boolean;
}

export interface TopEarner {
  rank: number;
  userId: string;
  name: string;
  totalCommission: number;
}

export type MemberCategory = "newcomer" | "experienced";

export interface TeamMember {
  userId: string;
  name: string;
  totalSales: number;
  category: MemberCategory | null;
  month: number | null;
}

export interface Streak {
  streak: number;
  lastWin?: string;
  loseStreak: number;
  name?: string;
}

export type StreakMap = Record<string, Streak>;

/** Teammitglied wie /api/auth/team-members es liefert. */
export interface ArenaUser {
  id: string;
  name: string;
  role: string;
  isActive?: boolean;
  battleInactive?: boolean;
}

/** Ein Sale mit allem, was die Arena und der Sales-Dialog brauchen. */
export interface BattleProduct extends ArenaProduct {
  id: string;
  isPremium?: boolean;
}

export type PointConfig = Record<string, number>;

export type AutoAssignMode = "standard" | "month_1_match" | "exact_month_match" | "completely_free";

export interface Readiness {
  inactive: InactiveBerater[];
  sickToday: ReadinessEntry[];
  newcomers: ReadinessEntry[];
  experienced: ReadinessEntry[];
}

/** Alles, was die Arena auf einmal lädt. */
export interface BattleSnapshot {
  myChallenges: Challenge[];
  activeBattles: Challenge[];
  completedBattles: Challenge[];
  readiness: Readiness;
  topEarners: TopEarner[];
  streaks: StreakMap;
  points: PointConfig | null;
}

export interface SaleDetail {
  type: string;
  timestamp: string;
}

/** Eintrag der Battle-Historie für Admin und Teamleiter. */
export interface AdminBattle {
  _id: string;
  challengerId?: string;
  challengerName: string;
  opponentId?: string;
  opponentName: string;
  sickUserId?: string;
  challengerScore: number;
  opponentScore: number;
  status: ChallengeStatus | string;
  isAutoAssigned: boolean;
  date: string;
  createdAt: string;
  challengerSalesDetails?: SaleDetail[];
  opponentSalesDetails?: SaleDetail[];
}

/** Antwort jeder Battle-Aktion: Erfolg oder eine Meldung für den Toast. */
export interface ActionResult<T = undefined> {
  success: boolean;
  message?: string;
  data?: T;
}
