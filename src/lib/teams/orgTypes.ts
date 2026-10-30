import type { MemberStats } from "../overview/manageLogic";
import type { TeamUser } from "../overview/teamTypes";

/** Was jemand auf der Seite Meine Teams sieht: alles (Admin), das Team, die eigene Gruppe oder die Mentees. */
export type OrgScope = "all" | "team" | "group" | "mentees";

/** Team aus v1 GET /teams (Name und Leitung). */
export interface OrgTeam {
  id: string;
  name: string;
  leaderId?: string;
}

export interface OrgPersonNode {
  kind: "person";
  id: string;
  user: TeamUser;
  children: OrgNode[];
}

export interface OrgTeamNode {
  kind: "team";
  id: string;
  team: OrgTeam;
  children: OrgNode[];
}

export type OrgNode = OrgPersonNode | OrgTeamNode;

/** Summe eines Astes: die Person selbst und alle darunter. */
export interface OrgTotals extends Pick<MemberStats, "salesToday" | "salesMonth" | "doorsToday"> {
  people: number;
  out: number;
}

export type OrgFilter = "all" | "leads" | "out" | "unassigned" | "inactive";

/** Alle Teams mit allen Personen (nur Admin, v1 GET /teams und /admin/users). */
export interface OrgDirectory {
  teams: OrgTeam[];
  users: TeamUser[];
}
