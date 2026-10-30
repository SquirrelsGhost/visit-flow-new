import type { VisitStatus } from "../map/mapTypes";

/** Teammitglied, wie /api/auth/team-members es in v1 liefert (nur die Felder, die die Übersicht braucht). */
export interface TeamUser {
  id: string;
  name: string;
  email?: string;
  role: string;
  teamId?: string;
  strukturleiterId?: string;
  mentorId?: string;
  isActive?: boolean;
  /** Vom Admin gesperrt (v1 isBlocked); nur in der Admin-Liste /admin/users enthalten. */
  isBlocked?: boolean;
  battleInactive?: boolean;
  /** Tagesstatus aus v1 (shared/utils/dailyStatus): active, wakeup_inactive, sick, inactive. */
  dailyStatus?: string;
  dailyStatusReason?: string;
  dailyStatusStartDate?: string;
  dailyStatusEndDate?: string;
  dailyStatusUpdatedAt?: string;
  /** Beginn der Betreuung (v1 menteeUtils: Vertragsstart, sonst Mentor-Zuordnung, sonst Anlage). */
  vodafoneContractStart?: string;
  mentorAssignedAt?: string;
  createdAt?: string;
  isRegularBerater?: boolean;
}

/** Verkauf eines Teammitglieds (v1 /api/products/team/:teamId). */
export interface TeamProduct {
  id: string;
  userId: string;
  category: string;
  quantity?: number;
  timestamp: string;
  vertical?: string;
  isPointRelevant?: boolean;
  /** Provision in Euro, wenn v1 sie mitliefert (Auswertung). */
  commissionEuro?: number;
}

/** Erfasste Tür eines Teammitglieds (v1 /api/doors/team/:teamId). */
export interface TeamDoor {
  id: string;
  userId: string;
  status: VisitStatus;
  timestamp: string;
}

export interface TeamData {
  users: TeamUser[];
  products: TeamProduct[];
  doors: TeamDoor[];
}
