/** Gewinnspiel wie v1 Incentive (types/index.ts), nur die Felder, die die App nutzt. */
export type ContestKind = "all" | "groups" | "individual" | "custom-groups";
export type ContestMode = "race" | "qualification";
export type ContestStatus = "active" | "completed" | "cancelled" | "planned";
export type ContestScope = "team" | "mentor" | "strukturleiter";

export interface ContestGoal {
  category: string;
  target: number;
}

export interface ContestPrize {
  rank: number;
  prize: string;
}

export interface ContestGroup {
  id: string;
  name: string;
  color?: string;
  memberIds: string[];
}

export interface Contest {
  id: string;
  teamId: string;
  name: string;
  description?: string;
  type: ContestKind;
  contestType: ContestMode;
  goals: ContestGoal[];
  prizes: ContestPrize[];
  selectedUserIds?: string[];
  strukturleiterIds?: string[];
  customGroups?: ContestGroup[];
  startDate: string;
  endDate: string;
  status: ContestStatus;
  scope?: ContestScope;
  createdBy: string;
  createdAt: string;
}

export interface GoalProgress {
  category: string;
  current: number;
  target: number;
  today: number;
  yesterday: number;
}

/** Eine Zeile der Rangliste: Person oder, bei eigenen Gruppen, eine Gruppe. */
export interface ContestStanding {
  id: string;
  name: string;
  /** Mittelwert der Zielerreichung 0 bis 100. */
  progress: number;
  goals: GoalProgress[];
  rank: number;
  qualified: boolean;
  memberNames: string[];
}
