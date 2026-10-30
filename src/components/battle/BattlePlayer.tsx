import type { DuelSide } from "../../lib/battle/duel";
import type { Streak } from "../../lib/battle/battleTypes";
import { cn } from "../../lib/cn";
import DuelAvatar from "./DuelAvatar";
import MemberStreak from "./MemberStreak";

interface BattlePlayerProps {
  name: string;
  side: DuelSide;
  leads: boolean;
  streak: Streak | undefined;
}

/** Eine Seite einer Duell-Karte: Bild in Teamfarbe (Krone bei Führung), Vorname und Serie. */
export default function BattlePlayer({ name, side, leads, streak }: BattlePlayerProps) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-1.5 text-center">
      <DuelAvatar name={name} side={side} leads={leads} />
      <span className={cn("w-full truncate text-[13px] font-semibold", leads ? "text-foreground" : "text-slate-600 dark:text-white/70")}>{name}</span>
      <span className="flex h-4 items-center">
        <MemberStreak streak={streak} compact />
      </span>
    </div>
  );
}
