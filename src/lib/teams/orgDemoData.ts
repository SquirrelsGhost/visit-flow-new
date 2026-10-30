import { DEMO_TEAM_ID, demoTeamUsers } from "../overview/teamDemoData";
import type { TeamUser } from "../overview/teamTypes";
import type { OrgDirectory } from "./orgTypes";

/** Zwei weitere Teams für die Admin-Ansicht der Demo; das erste Team ist das bekannte Beispielteam. */
const OTHER: readonly [id: string, name: string, role: string, team: string, strukturleiter?: string, mentor?: string][] = [
  ["n1", "Sven Krüger", "teamleiter", "demo-nord"],
  ["n2", "Hanna Vogel", "strukturleiter", "demo-nord"],
  ["n3", "Ben Schröder", "mentor", "demo-nord", "n2"],
  ["n4", "Emma Neumann", "berater", "demo-nord", "n2", "n3"],
  ["n5", "Paul Zimmermann", "berater", "demo-nord", "n2"],
  ["n6", "Lina Hartmann", "berater", "demo-nord"],
  ["s1", "Deniz Aksoy", "teamleiter", "demo-sued"],
  ["s2", "Clara Lange", "berater", "demo-sued", undefined, "s3"],
  ["s3", "Max Krause", "mentor", "demo-sued"],
  ["s4", "Ella Schmitt", "berater", "demo-sued"],
];

/** Tagesleistung der zusätzlichen Demo-Personen (Abschlüsse je Tag). */
export const DEMO_STRENGTH: Record<string, number> = { n1: 1, n2: 3, n3: 2, n4: 2, n5: 1, n6: 0, s1: 1, s2: 2, s3: 2, s4: 1 };

export function demoDirectory(): OrgDirectory {
  const others: TeamUser[] = OTHER.map(([id, name, role, teamId, strukturleiterId, mentorId]) => ({
    id,
    name,
    email: `${name.split(" ")[0]?.toLowerCase()}@demo.local`,
    role,
    teamId,
    strukturleiterId,
    mentorId,
    isActive: true,
    isBlocked: id === "n6",
  }));
  return {
    teams: [
      { id: DEMO_TEAM_ID, name: "Team Braun", leaderId: "tl" },
      { id: "demo-nord", name: "Team Nord", leaderId: "n1" },
      { id: "demo-sued", name: "Team Süd", leaderId: "s1" },
    ],
    users: [...demoTeamUsers(), ...others],
  };
}
