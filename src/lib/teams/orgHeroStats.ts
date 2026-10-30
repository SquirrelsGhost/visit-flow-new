import type { TeamPulse } from "../overview/manageLogic";
import type { TeamUser } from "../overview/teamTypes";
import { statusOf } from "../overview/manageLogic";
import { teamsTexts } from "../../texts/teamsTexts";
import { fill } from "../../texts/profileTexts";

export interface OrgHeroContent {
  value: number;
  unit: string;
  line: string;
  stats: { label: string; value: number; warn?: boolean }[];
}

const texts = teamsTexts.hero;

/** Kopfzahlen für Teamleiter, Strukturleiter und Mentoren: Abschlüsse heute, wer im Einsatz ist. */
export function leaderHero(pulse: TeamPulse): OrgHeroContent {
  return {
    value: pulse.salesToday,
    unit: pulse.salesToday === 1 ? texts.salesOne : texts.sales,
    line: fill(texts.line, { doors: pulse.doorsToday, conversion: pulse.conversion, month: pulse.salesMonth }),
    stats: [
      { label: texts.working, value: pulse.working },
      { label: texts.out, value: pulse.out, warn: true },
      { label: texts.members, value: pulse.members },
    ],
  };
}

/** Kopfzahlen für Admins über alle Teams: Personen, Teams, Führung; dazu wer fehlt und wer gesperrt ist. */
export function adminHero(users: readonly TeamUser[], teams: number, now = new Date()): OrgHeroContent {
  const active = users.filter((u) => u.isActive !== false && !u.isBlocked);
  const out = active.filter((u) => statusOf(u, now) === "sick" || statusOf(u, now) === "inactive").length;
  const leads = active.filter((u) => u.role === "teamleiter" || u.role === "strukturleiter" || u.role === "mentor").length;
  return {
    value: active.length,
    unit: active.length === 1 ? texts.peopleOne : texts.people,
    line: fill(texts.adminLine, { teams, leads }),
    stats: [
      { label: texts.working, value: active.length - out },
      { label: texts.out, value: out, warn: true },
      { label: texts.blocked, value: users.filter((u) => u.isBlocked).length, warn: true },
    ],
  };
}
