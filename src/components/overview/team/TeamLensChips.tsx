import { leadsFor } from "../../../lib/overview/structureLogic";
import type { TeamUser } from "../../../lib/overview/teamTypes";
import { overviewTexts } from "../../../texts/overviewTexts";
import GlassFilterChips from "../../glass/GlassFilterChips";

/** "Ganzes Team" steht für die Verwaltung, jede andere Plakette für die Gruppe eines Strukturleiters. */
export const WHOLE_TEAM = "all";

export interface TeamLens {
  active: string;
  onChange: (id: string) => void;
}

interface TeamLensChipsProps extends TeamLens {
  users: readonly TeamUser[];
}

/** Blickwinkel des Admin-Reiters "Team": ganzes Team oder eine Strukturleiter-Gruppe. */
export default function TeamLensChips({ users, active, onChange }: TeamLensChipsProps) {
  const leads = leadsFor(users, "structure");
  if (leads.length === 0) return null;
  const options = [{ id: WHOLE_TEAM, label: overviewTexts.teamLens.all }, ...leads.map((l) => ({ id: l.id, label: l.name }))];
  return <GlassFilterChips label={overviewTexts.teamLens.label} layoutId="overview-team-lens" active={active} onChange={onChange} options={options} />;
}
