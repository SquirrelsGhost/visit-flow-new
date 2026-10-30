import { Trash2, Trophy } from "lucide-react";
import type { ContestClock } from "../../../lib/overview/contestLogic";
import type { Contest } from "../../../lib/overview/contestTypes";
import { overviewTexts } from "../../../texts/overviewTexts";
import GlassCard from "../../glass/GlassCard";
import GlassChip from "../../glass/GlassChip";
import ContestCountdown from "./ContestCountdown";
import ContestTimeBar from "./ContestTimeBar";

interface ContestHeroProps {
  contest: Contest;
  clock: ContestClock;
  /** Nur wer das Gewinnspiel angelegt hat, darf es löschen (v1). */
  onDelete?: () => void;
}

const texts = overviewTexts.contest;
const ICON = "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 via-orange-400 to-red-500 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_10px_24px_-10px_rgba(251,146,60,0.9)]";

/** Kopf des Gewinnspiels als tiefe Karte mit warmem Goldschein: Name, Art, Status und Countdown oder Zeitbalken. */
export default function ContestHero({ contest, clock, onDelete }: ContestHeroProps) {
  return (
    <GlassCard variant="deep" sheen spotlight className="px-5 pb-5 pt-5">
      <span aria-hidden className="pointer-events-none absolute -left-10 -top-16 h-56 w-56 rounded-full bg-[radial-gradient(closest-side,rgba(251,146,60,0.4),transparent)]" />
      <div className="relative flex items-start gap-3.5">
        <span aria-hidden className={ICON}>
          <Trophy className="h-6 w-6" strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-[21px] font-semibold leading-tight tracking-[-0.02em] text-white">{contest.name}</h2>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <GlassChip tone="amber" onDeep>
              {contest.contestType === "race" ? texts.race : texts.qualification}
            </GlassChip>
            <GlassChip tone={clock.started ? "green" : "slate"} onDeep>
              {clock.started ? texts.live : texts.planned}
            </GlassChip>
          </div>
        </div>
        {onDelete && (
          <button type="button" onClick={onDelete} aria-label={texts.delete} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/[0.08] text-white/80 ring-1 ring-inset ring-white/10 transition-colors hover:bg-red-500/30 hover:text-white">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
      {contest.description && <p className="relative mt-4 text-[13.5px] leading-relaxed text-white/65">{contest.description}</p>}
      <div className="relative">{clock.countdown ? <ContestCountdown countdown={clock.countdown} /> : <ContestTimeBar share={clock.timeShare} daysLeft={clock.daysLeft} />}</div>
    </GlassCard>
  );
}
