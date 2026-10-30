// Langes Drücken und das Einblenden von "Stornieren" brauchen State
"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useLongPress } from "../../hooks/useLongPress";
import { duelState } from "../../lib/battle/duel";
import type { Challenge, Streak } from "../../lib/battle/battleTypes";
import { cn } from "../../lib/cn";
import BattleCardActions from "./BattleCardActions";
import BattlePlayer from "./BattlePlayer";
import DuelBadges from "./DuelBadges";
import { ARENA_CARD } from "./battleStyles";
import RollingScore from "./RollingScore";
import TugBar from "./TugBar";

const REVEAL_MS = 3000;

interface ActiveBattleCardProps {
  battle: Challenge;
  leftScore: number;
  rightScore: number;
  leftStreak: Streak | undefined;
  rightStreak: Streak | undefined;
  mine: boolean;
  canManage: boolean;
  cancelling: boolean;
  onSick: () => void;
  onCancel: () => void;
}

/**
 * Laufendes Battle als Duell-Karte: zwei Seiten in Teamfarben, Live-Punkte und Tauziehen-Balken.
 * Lange drücken: eigenes Battle → Krankmeldung; Admin/Teamleiter → "Stornieren" für 3 s.
 */
export default function ActiveBattleCard(props: ActiveBattleCardProps) {
  const { battle: c, leftScore, rightScore, leftStreak, rightStreak, mine, canManage, cancelling, onSick, onCancel } = props;
  const [reveal, setReveal] = useState(false);
  useEffect(() => {
    if (!reveal) return;
    const timer = setTimeout(() => setReveal(false), REVEAL_MS);
    return () => clearTimeout(timer);
  }, [reveal]);

  const press = useLongPress(mine || canManage ? () => (canManage ? setReveal(true) : onSick()) : null);
  const duel = duelState(leftScore, rightScore);
  return (
    <motion.div layout="position" transition={{ type: "spring", stiffness: 300, damping: 30 }} {...press} className="select-none">
      <div className={cn(ARENA_CARD, "px-4 pb-4 pt-4", mine && "ring-2 ring-red-500/35")}>
        {mine && <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(70%_80%_at_50%_0%,rgba(239,68,68,0.10),transparent)]" />}
        <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <BattlePlayer name={c.challengerName} side="left" leads={duel.leader === "left"} streak={leftStreak} />
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-baseline gap-1.5 text-[34px] font-semibold leading-none tracking-[-0.03em]">
              <RollingScore value={leftScore} leads={duel.leader === "left"} />
              <span className="text-[16px] font-medium text-slate-300 dark:text-white/25">:</span>
              <RollingScore value={rightScore} leads={duel.leader === "right"} />
            </div>
            <DuelBadges mine={mine} auto={!!c.isAutoAssigned} />
          </div>
          <BattlePlayer name={c.opponentName} side="right" leads={duel.leader === "right"} streak={rightStreak} />
        </div>
        <TugBar share={duel.share} leader={duel.leader} label={`${c.challengerName} ${leftScore} : ${rightScore} ${c.opponentName}`} className="relative mt-3.5" />
      </div>
      <BattleCardActions open={canManage && reveal} mine={mine} cancelling={cancelling} onCancel={() => (setReveal(false), onCancel())} onSick={() => (setReveal(false), onSick())} />
    </motion.div>
  );
}
