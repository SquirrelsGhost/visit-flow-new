import { Swords } from "lucide-react";
import type { FeaturedDuel } from "../../../lib/battle/duel";
import type { Streak } from "../../../lib/battle/battleTypes";
import { battleTexts as t } from "../../../texts/battleTexts";
import HeroDuel from "./HeroDuel";
import HeroStat from "./HeroStat";

interface HeroFrontProps {
  duel: FeaturedDuel | null;
  scoreOf: (userId: string) => number;
  sales: number;
  battles: number;
  streak: Streak | undefined;
}

/** Arena-Seite der Kopfkarte: das eigene (oder heißeste) Duell live, darunter eigene Sales, laufende Battles und Serie. */
export default function HeroFront({ duel, scoreOf, sales, battles, streak }: HeroFrontProps) {
  return (
    <div className="pt-5">
      {duel ? (
        <HeroDuel
          battle={duel.battle}
          mine={duel.mine}
          leftScore={scoreOf(duel.battle.challengerId)}
          rightScore={scoreOf(duel.battle.opponentId)}
        />
      ) : (
        <div className="flex flex-col items-center py-4 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.08] ring-1 ring-inset ring-white/15">
            <Swords aria-hidden className="h-6 w-6 text-white/80" />
          </span>
          <p className="mt-3 text-[19px] font-semibold tracking-[-0.02em] text-white">{t.noDuel}</p>
          <p className="mt-1 text-[13px] text-white/55">{t.noDuelHint}</p>
        </div>
      )}
      <div className="mt-5 grid grid-cols-3 gap-2 border-t border-white/10 pt-4">
        <HeroStat label={t.statSales} value={sales} />
        <HeroStat label={t.statBattles} value={battles} live={battles > 0} />
        <HeroStat label={t.statStreak} value={streak?.streak ?? 0} flame={(streak?.streak ?? 0) > 0} />
      </div>
    </div>
  );
}
