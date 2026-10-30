import { Trophy } from "lucide-react";
import type { Contest, ContestStanding } from "../../../lib/overview/contestTypes";
import { overviewTexts } from "../../../texts/overviewTexts";
import GlassSection from "../../glass/GlassSection";
import StandingRow from "./StandingRow";

interface StandingsSectionProps {
  contest: Contest;
  standings: readonly ContestStanding[];
  ownId: string;
  started: boolean;
}

const texts = overviewTexts.contest;
const PODIUM = 3;

/**
 * Rangliste (Rennen, Verlosung, Gruppen) oder Team-Fortschritt alphabetisch (ganzes Team), wie v1.
 * Vor dem Start nur ein Hinweis, damit niemand eine leere Tabelle sieht.
 */
export default function StandingsSection({ contest, standings, ownId, started }: StandingsSectionProps) {
  const ranked = contest.type !== "all";
  const rows = ranked ? standings : [...standings].sort((a, b) => a.name.localeCompare(b.name, "de"));
  const ownLabel = contest.type === "custom-groups" ? texts.yourGroup : texts.you;
  const label = ranked ? texts.ranking : texts.teamProgress;
  if (!started || rows.length === 0) {
    return (
      <GlassSection label={label}>
        <div className="flex flex-col items-center gap-2 px-6 py-8 text-center">
          <Trophy aria-hidden className="h-8 w-8 text-slate-300 dark:text-white/20" />
          <p className="text-[14px] font-medium text-muted-foreground">{started ? texts.noParticipants : texts.notStarted}</p>
        </div>
      </GlassSection>
    );
  }
  return (
    <GlassSection label={label} footer={texts.rankingFooter}>
      {rows.map((s) => (
        <StandingRow key={s.id} standing={s} ranked={ranked} own={s.id === ownId} ownLabel={ownLabel} detailed={!ranked || s.rank <= PODIUM || s.id === ownId} />
      ))}
    </GlassSection>
  );
}
