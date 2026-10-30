import { involves, sortActiveBattles } from "../../lib/battle/battleSelectors";
import type { Challenge, StreakMap } from "../../lib/battle/battleTypes";
import { battleTexts as t } from "../../texts/battleTexts";
import ActiveBattleCard from "./ActiveBattleCard";
import ArenaSection from "./ArenaSection";
import CopyBattlesButton from "./CopyBattlesButton";
import SectionTitle from "./SectionTitle";

interface ActiveBattlesProps {
  battles: Challenge[];
  streaks: StreakMap;
  meId: string;
  canManage: boolean;
  scoreOf: (userId: string) => number;
  isBusy: (key: string) => boolean;
  onSick: (id: string) => void;
  onCancel: (id: string) => void;
}

/** Alle laufenden Battles des Teams als Duell-Karten, eigenes zuerst, dann nach Gesamtpunkten. */
export default function ActiveBattles({ battles, streaks, meId, canManage, scoreOf, isBusy, onSick, onCancel }: ActiveBattlesProps) {
  if (battles.length === 0) return null;
  const title = (
    <SectionTitle live count={battles.length} action={<CopyBattlesButton battles={battles} streaks={streaks} />}>
      {t.activeTitle}
    </SectionTitle>
  );
  return (
    <ArenaSection title={title}>
      <div className="space-y-2.5">
        {sortActiveBattles(battles, meId, scoreOf).map((c) => (
          <ActiveBattleCard
            key={c.id}
            battle={c}
            leftScore={scoreOf(c.challengerId)}
            rightScore={scoreOf(c.opponentId)}
            leftStreak={streaks[c.challengerId]}
            rightStreak={streaks[c.opponentId]}
            mine={involves(c, meId)}
            canManage={canManage}
            cancelling={isBusy(`cancel:${c.id}`)}
            onSick={() => onSick(c.id)}
            onCancel={() => onCancel(c.id)}
          />
        ))}
      </div>
    </ArenaSection>
  );
}
