import { motion } from "motion/react";
import { cn } from "../../../lib/cn";
import type { ContestStanding } from "../../../lib/overview/contestTypes";
import { fill } from "../../../texts/profileTexts";
import { overviewTexts } from "../../../texts/overviewTexts";
import GlassChip from "../../glass/GlassChip";
import GlassNumber from "../../glass/GlassNumber";
import GoalBar from "./GoalBar";
import RankBadge from "./RankBadge";

interface StandingRowProps {
  standing: ContestStanding;
  /** Ohne Rang (Team-Fortschritt bei "ganzes Team"). */
  ranked: boolean;
  own: boolean;
  ownLabel: string;
  /** Ziele aufgeklappt zeigen (Podium und eigene Zeile). */
  detailed: boolean;
}

const texts = overviewTexts.contest;

/** Eine Zeile der Rangliste; die eigene Zeile leuchtet warm, das Podium zeigt seine Ziele. */
export default function StandingRow({ standing, ranked, own, ownLabel, detailed }: StandingRowProps) {
  return (
    <motion.div layout="position" className={cn("relative px-4 py-3.5", own && "bg-gradient-to-r from-amber-400/[0.14] via-orange-400/[0.08] to-transparent")}>
      {own && <span aria-hidden className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-gradient-to-b from-amber-300 to-orange-500" />}
      <div className="flex items-center gap-3.5">
        {ranked ? (
          <RankBadge rank={standing.rank} />
        ) : (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-300 to-slate-500 text-[14px] font-semibold text-white">{standing.name.charAt(0).toUpperCase()}</span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-[15px] font-semibold text-foreground">{standing.name}</span>
            {own && <GlassChip tone="amber">{ownLabel}</GlassChip>}
          </div>
          {standing.qualified && <span className="mt-0.5 block text-[12px] font-semibold text-emerald-600 dark:text-emerald-400">{texts.qualified}</span>}
          {standing.memberNames.length > 0 && (
            <span className="mt-0.5 block truncate text-[12px] text-muted-foreground">{fill(texts.members, { count: standing.memberNames.length, names: standing.memberNames.join(", ") })}</span>
          )}
        </div>
        <GlassNumber value={Math.round(standing.progress)} kind="percent" duration={1} className="text-[17px] font-semibold text-foreground" />
      </div>
      {detailed && (
        <div className="mt-3 space-y-2.5 pl-[3.125rem]">
          {standing.goals.map((goal) => (
            <GoalBar key={goal.category} goal={goal} />
          ))}
        </div>
      )}
    </motion.div>
  );
}
