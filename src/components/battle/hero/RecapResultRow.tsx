import { Trophy } from "lucide-react";
import type { Challenge } from "../../../lib/battle/battleTypes";
import { cn } from "../../../lib/cn";

interface RecapResultRowProps {
  battle: Challenge;
  index: number;
}

const name = (won: boolean, lost: boolean) => (won ? "text-amber-200" : lost ? "text-white/45" : "text-white/80");

/** Ergebnis eines abgeschlossenen Battles: Sieger golden mit Pokal, Verlierer gedämpft, Remis neutral. */
export default function RecapResultRow({ battle: b }: RecapResultRowProps) {
  const leftWon = !!b.winnerId && b.winnerId === b.challengerId;
  const rightWon = !!b.winnerId && b.winnerId === b.opponentId;
  return (
    <div className={cn("grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-2xl px-3.5 py-3 ring-1 ring-inset", b.winnerId ? "bg-white/[0.05] ring-white/[0.08]" : "bg-sky-400/[0.06] ring-sky-300/15")}>
      <p className={cn("flex min-w-0 items-center gap-1.5 truncate text-[13.5px] font-semibold", name(leftWon, rightWon))}>
        {leftWon && <Trophy aria-hidden className="h-3.5 w-3.5 shrink-0 text-amber-300" />}
        <span className="truncate">{b.challengerName}</span>
      </p>
      <p className="flex items-center gap-1.5 text-[17px] font-semibold tabular-nums">
        <span className={leftWon ? "text-amber-300" : "text-white/60"}>{b.challengerScore}</span>
        <span className="text-[12px] text-white/25">:</span>
        <span className={rightWon ? "text-amber-300" : "text-white/60"}>{b.opponentScore}</span>
      </p>
      <p className={cn("flex min-w-0 items-center justify-end gap-1.5 truncate text-right text-[13.5px] font-semibold", name(rightWon, leftWon))}>
        <span className="truncate">{b.opponentName}</span>
        {rightWon && <Trophy aria-hidden className="h-3.5 w-3.5 shrink-0 text-amber-300" />}
      </p>
    </div>
  );
}
