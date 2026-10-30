import { duelState } from "../../../lib/battle/duel";
import type { Challenge } from "../../../lib/battle/battleTypes";
import { cn } from "../../../lib/cn";
import { battleTexts as t } from "../../../texts/battleTexts";
import DuelAvatar from "../DuelAvatar";
import RollingScore from "../RollingScore";
import TugBar from "../TugBar";

interface HeroDuelProps {
  battle: Challenge;
  mine: boolean;
  leftScore: number;
  rightScore: number;
}

/** Großes Kopf-an-Kopf auf der Kopfkarte: zwei Kämpfer, Live-Punkte, Tauziehen-Balken und wer gerade führt. */
export default function HeroDuel({ battle: b, mine, leftScore, rightScore }: HeroDuelProps) {
  const duel = duelState(leftScore, rightScore);
  const leaderName = duel.leader === "left" ? b.challengerName : duel.leader === "right" ? b.opponentName : null;
  const caption = leaderName ? t.leads(leaderName.split(" ")[0], duel.gap) : leftScore + rightScore === 0 ? t.tiedZero : t.tied;
  return (
    <div>
      <p className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">{mine ? t.yourDuel : t.topDuel}</p>
      <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <Fighter name={b.challengerName} side="left" leads={duel.leader === "left"} />
        <div className="flex items-baseline gap-2 text-[46px] font-semibold leading-none tracking-[-0.04em] min-[400px]:text-[52px]">
          <RollingScore value={leftScore} leads={duel.leader === "left"} onDeep />
          <span className="text-[22px] font-medium text-white/30">:</span>
          <RollingScore value={rightScore} leads={duel.leader === "right"} onDeep />
        </div>
        <Fighter name={b.opponentName} side="right" leads={duel.leader === "right"} />
      </div>
      <TugBar share={duel.share} leader={duel.leader} label={caption} onDeep className="mt-5" />
      <p className={cn("mt-3 text-center text-[13px] font-medium", leaderName ? "text-amber-200" : "text-white/60")}>{caption}</p>
    </div>
  );
}

interface FighterProps {
  name: string;
  side: "left" | "right";
  leads: boolean;
}

function Fighter({ name, side, leads }: FighterProps) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-2 text-center">
      <DuelAvatar name={name} side={side} leads={leads} size="lg" />
      <span className={cn("w-full truncate text-[13px] font-semibold", leads ? "text-white" : "text-white/70")}>{name}</span>
    </div>
  );
}
