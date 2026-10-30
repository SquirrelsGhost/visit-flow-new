import { statusOf } from "../overview/manageLogic";
import type { TeamUser } from "../overview/teamTypes";
import type { OrgDirectory } from "../teams/orgTypes";

const LEADS = new Set(["teamleiter", "strukturleiter", "mentor", "gebietsmanager"]);

/** Wer da ist, wer fehlt, wer neu ist: Zahlen über alle Teams für die Karte Team. */
export interface AdminTeamSummary {
  people: number;
  teams: number;
  leads: number;
  working: number;
  out: number;
  blocked: number;
  /** Ohne Team (v1 teamId leer). */
  unassigned: number;
  /** Diesen Monat angelegt. */
  newThisMonth: number;
}

const inMonth = (value: string | undefined, now: Date) => {
  if (!value) return false;
  const d = new Date(value);
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
};

export function adminTeamSummary(directory: OrgDirectory, now = new Date()): AdminTeamSummary {
  const active = directory.users.filter((u: TeamUser) => u.isActive !== false && !u.isBlocked);
  const out = active.filter((u) => statusOf(u, now) === "sick" || statusOf(u, now) === "inactive").length;
  return {
    people: active.length,
    teams: directory.teams.length,
    leads: active.filter((u) => LEADS.has(u.role)).length,
    working: active.length - out,
    out,
    blocked: directory.users.filter((u) => u.isBlocked).length,
    unassigned: active.filter((u) => !u.teamId && u.role !== "admin").length,
    newThisMonth: directory.users.filter((u) => inMonth(u.createdAt, now)).length,
  };
}
