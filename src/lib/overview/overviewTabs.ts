import { isRole, type Role } from "../../shared/auth/roles";

export type OverviewTab = "team" | "manage" | "structure" | "today" | "contest";

const MANAGE_ROLES: readonly Role[] = ["teamleiter"];
const STRUCTURE_ROLES: readonly Role[] = ["strukturleiter", "mentor"];

/**
 * Reiter der Übersicht je Rolle, Reihenfolge wie v1 SwipeableDailyView:
 * Verwaltung (Teamleiter), Struktur bzw. Mentor (Strukturleiter, Mentor), Übersicht,
 * Gewinnspiel nur, wenn gerade eines läuft oder geplant ist. Admins bekommen statt Verwaltung und Struktur
 * einen Reiter "Team", der beides per Plaketten umschaltet.
 */
export function overviewTabsFor(role: string, hasContests: boolean): OverviewTab[] {
  const r = isRole(role) ? role : "berater";
  const tabs: OverviewTab[] = [];
  if (r === "admin") tabs.push("team");
  if (MANAGE_ROLES.includes(r)) tabs.push("manage");
  if (STRUCTURE_ROLES.includes(r)) tabs.push("structure");
  tabs.push("today");
  if (hasContests) tabs.push("contest");
  return tabs;
}

/** Mentoren sehen im mittleren Reiter ihre Mentees (v1: "Mentor", in Lead "Ausbilder"), alle anderen die Struktur. */
export function structureLabelKey(role: string, solar: boolean): "structure" | "mentor" | "trainer" {
  if (role === "strukturleiter") return "structure";
  return solar ? "trainer" : "mentor";
}
