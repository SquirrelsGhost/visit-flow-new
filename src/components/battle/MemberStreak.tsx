import { Flame, TrendingDown } from "lucide-react";
import type { Streak } from "../../lib/battle/battleTypes";
import { cn } from "../../lib/cn";
import { battleTexts as t } from "../../texts/battleTexts";

interface MemberStreakProps {
  streak: Streak | undefined;
  /** Nur die Zahl mit Symbol (für enge Stellen). */
  compact?: boolean;
  className?: string;
}

/** Siegesserie als flackernde Flamme (ab 3 Siegen größer und heller), Niederlagenserie ruhig in Rot. */
export default function MemberStreak({ streak, compact = false, className }: MemberStreakProps) {
  if (!streak) return null;
  if (streak.streak > 0) {
    const hot = streak.streak >= 3;
    return (
      <span className={cn("inline-flex items-center gap-1 text-[12px] font-semibold text-orange-600 dark:text-orange-400", className)}>
        <Flame aria-hidden className={cn("arena-flame fill-orange-400/80 text-orange-500", hot ? "h-4 w-4 fill-amber-300 text-orange-500" : "h-3.5 w-3.5")} />
        {compact ? streak.streak : t.winStreak(streak.streak)}
      </span>
    );
  }
  if (streak.loseStreak > 0) {
    return (
      <span className={cn("inline-flex items-center gap-1 text-[12px] font-medium text-slate-500 dark:text-white/45", className)}>
        <TrendingDown aria-hidden className="h-3.5 w-3.5 text-red-500/80" />
        {compact ? streak.loseStreak : t.loseStreak(streak.loseStreak)}
      </span>
    );
  }
  return null;
}
