import type { Vertical } from "../battle/battleCategories";
import { productGroupsFor } from "./productGroups";
import type { TeamProduct } from "./teamTypes";
import { localDay } from "./todayStats";

/** Monatsziel je Produktgruppe; "total" ist das Gesamtziel aller Gruppen. */
export type TeamGoals = Record<string, number>;

export interface GoalLine {
  category: string;
  current: number;
  target: number;
}

/** v1 speichert die Telco-Ziele unter team_goals_<team> und schreibt GigaTV als "Giga TV". */
const V1_NAMES: Record<string, string> = { GigaTV: "Giga TV" };
const keyOf = (teamId: string, vertical: Vertical) => (vertical === "telco" ? `team_goals_${teamId}` : `team_goals_${teamId}_${vertical}`);

export function readTeamGoals(teamId: string, vertical: Vertical): TeamGoals {
  const goals: TeamGoals = { total: 0 };
  for (const g of productGroupsFor(vertical)) goals[g] = 0;
  try {
    const raw = window.localStorage.getItem(keyOf(teamId, vertical));
    const stored = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    for (const key of Object.keys(goals)) {
      const value = Number(stored[V1_NAMES[key] ?? key] ?? 0);
      goals[key] = Number.isFinite(value) && value > 0 ? Math.round(value) : 0;
    }
  } catch {
    // ohne gespeicherte Ziele bleibt alles bei 0
  }
  return goals;
}

export function writeTeamGoals(teamId: string, vertical: Vertical, goals: TeamGoals): boolean {
  const out: Record<string, number> = {};
  for (const [key, value] of Object.entries(goals)) out[V1_NAMES[key] ?? key] = Math.max(0, Math.round(value));
  try {
    window.localStorage.setItem(keyOf(teamId, vertical), JSON.stringify(out));
    return true;
  } catch {
    return false;
  }
}

/** Stand im laufenden Monat je Gruppe mit Ziel; das Gesamtziel steht am Ende. */
export function goalLines(goals: TeamGoals, products: readonly TeamProduct[], vertical: Vertical, now = new Date()): GoalLine[] {
  const month = localDay(now).slice(0, 7);
  const inMonth = products.filter((p) => localDay(p.timestamp).startsWith(month));
  const count = (category?: string) => inMonth.filter((p) => !category || p.category === category).reduce((sum, p) => sum + (p.quantity ?? 1), 0);
  const lines = productGroupsFor(vertical)
    .filter((g) => (goals[g] ?? 0) > 0)
    .map((g) => ({ category: g as string, current: count(g), target: goals[g] ?? 0 }));
  if ((goals.total ?? 0) > 0) lines.push({ category: "total", current: count(), target: goals.total ?? 0 });
  return lines;
}

/** Anteil des Monats, der schon vorbei ist (für "im Plan" oder "dahinter"). */
export function monthShare(now = new Date()): number {
  const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return (now.getDate() - 1 + now.getHours() / 24) / days;
}
