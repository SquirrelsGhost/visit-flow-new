import { Users } from "lucide-react";
import { cn } from "../../lib/cn";
import type { OrgTeam, OrgTotals } from "../../lib/teams/orgTypes";
import { fill } from "../../texts/profileTexts";
import { teamsTexts } from "../../texts/teamsTexts";
import GlassIcon from "../glass/GlassIcon";
import { GLASS_ROW, GLASS_ROW_INTERACTIVE, GLASS_SUBTITLE, GLASS_TITLE } from "../glass/glassStyles";

interface OrgTeamRowProps {
  team: OrgTeam;
  leaderName?: string;
  totals: OrgTotals;
  /** Zahlen von heute sind erst nach dem ersten Aufklappen geladen. */
  hasNumbers: boolean;
  onToggle: () => void;
}

const texts = teamsTexts.tree;

/** Kopfzeile eines Teams in der Admin-Ansicht: Name, Leitung, Personen; rechts Abschlüsse heute. */
export default function OrgTeamRow({ team, leaderName, totals, hasNumbers, onToggle }: OrgTeamRowProps) {
  const line = fill(totals.out > 0 ? texts.teamLineOut : texts.teamLine, { leader: leaderName ?? texts.noLeader, people: totals.people, out: totals.out });
  return (
    <button type="button" onClick={onToggle} className={cn(GLASS_ROW, GLASS_ROW_INTERACTIVE, "min-w-0 flex-1 group")}>
      <GlassIcon icon={Users} tone={team.id ? "red" : "gray"} />
      <span className="min-w-0 flex-1">
        <span className={cn(GLASS_TITLE, "truncate")}>{team.name}</span>
        <span className={cn(GLASS_SUBTITLE, "truncate")}>{line}</span>
      </span>
      {hasNumbers && (
        <span className="flex shrink-0 flex-col items-end">
          <span className={cn("text-[17px] font-semibold tabular-nums leading-none", totals.salesToday > 0 ? "text-foreground" : "text-slate-300 dark:text-white/25")}>{totals.salesToday}</span>
          <span className="mt-1 text-[11px] text-muted-foreground">{fill(texts.month, { count: totals.salesMonth })}</span>
        </span>
      )}
    </button>
  );
}
