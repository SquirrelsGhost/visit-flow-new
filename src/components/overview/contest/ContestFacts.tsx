import { Award, CalendarDays, Target, Users } from "lucide-react";
import type { ContestClock } from "../../../lib/overview/contestLogic";
import type { Contest } from "../../../lib/overview/contestTypes";
import { categoryLabel } from "../../../lib/overview/productGroups";
import { fill } from "../../../texts/profileTexts";
import { overviewTexts } from "../../../texts/overviewTexts";
import GlassRow from "../../glass/GlassRow";
import GlassSection from "../../glass/GlassSection";

interface ContestFactsProps {
  contest: Contest;
  clock: ContestClock;
  participants: number;
}

const texts = overviewTexts.contest;
const DATE = new Intl.DateTimeFormat("de-DE", { day: "numeric", month: "long" });
const MEDALS = ["🥇", "🥈", "🥉"] as const;

const left = (days: number) => (days > 1 ? fill(texts.daysLeft, { days }) : days === 1 ? texts.dayLeft : texts.lastDay);

/** Eckdaten, Ziele und Preise als ruhige Glaszeilen statt vier bunter Kästen (v1 Stats-, Ziel- und Preis-Kacheln). */
export default function ContestFacts({ contest, clock, participants }: ContestFactsProps) {
  return (
    <>
      <GlassSection label={texts.facts}>
        <GlassRow icon={CalendarDays} tone="blue" title={texts.endsOn} subtitle={left(clock.daysLeft)} value={DATE.format(new Date(contest.endDate))} />
        <GlassRow icon={Users} tone="indigo" title={contest.type === "custom-groups" ? texts.groups : texts.participants} subtitle={texts.kinds[contest.type]} value={String(participants)} />
      </GlassSection>
      <GlassSection label={texts.goals}>
        {contest.goals.map((goal) => (
          <GlassRow key={goal.category} icon={Target} tone="orange" title={categoryLabel(goal.category)} value={fill(texts.goalTarget, { target: goal.target })} />
        ))}
      </GlassSection>
      <GlassSection label={texts.prizes}>
        {contest.prizes.map((prize) => (
          <div key={prize.rank} className="relative flex min-h-[3.5rem] items-center gap-3.5 px-4 py-3">
            <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center text-[22px]">
              {MEDALS[prize.rank - 1] ?? <Award className="h-5 w-5 text-amber-500" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-semibold leading-tight text-foreground">{prize.prize}</span>
              <span className="mt-0.5 block text-[12.5px] text-muted-foreground">{fill(texts.prizeRank, { rank: prize.rank })}</span>
            </span>
          </div>
        ))}
      </GlassSection>
    </>
  );
}
