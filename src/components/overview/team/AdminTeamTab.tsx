// Blickwinkel lebt im Browser
"use client";

import { useState } from "react";
import type { Vertical } from "../../../lib/battle/battleCategories";
import type { Contest } from "../../../lib/overview/contestTypes";
import ManageTab from "../manage/ManageTab";
import StructureTab from "../structure/StructureTab";
import { WHOLE_TEAM } from "./TeamLensChips";

interface AdminTeamTabProps {
  vertical: Vertical;
  contests: readonly Contest[];
}

/**
 * Reiter "Team" für Admins: Verwaltung und Struktur in einem. "Ganzes Team" zeigt die Verwaltung,
 * eine Strukturleiter-Plakette dessen Gruppe. Teamleiter, Strukturleiter und Mentoren behalten ihren einen Reiter.
 */
export default function AdminTeamTab({ vertical, contests }: AdminTeamTabProps) {
  const [active, setActive] = useState(WHOLE_TEAM);
  const lens = { active, onChange: setActive };
  return active === WHOLE_TEAM ? (
    <ManageTab vertical={vertical} contests={contests} teamLens={lens} />
  ) : (
    <StructureTab vertical={vertical} contests={contests} lens="structure" teamLens={lens} />
  );
}
