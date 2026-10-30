import { Crown } from "lucide-react";
import { cn } from "../../../lib/cn";

interface RankBadgeProps {
  rank: number;
}

const PODIUM = [
  "from-yellow-300 via-amber-400 to-orange-500 shadow-amber-500/50",
  "from-slate-200 via-slate-300 to-slate-500 shadow-slate-400/40",
  "from-orange-300 via-orange-500 to-red-600 shadow-orange-500/40",
] as const;

/** Platz in der Rangliste: Gold, Silber, Bronze als leuchtende Plakette, danach schlicht die Zahl. */
export default function RankBadge({ rank }: RankBadgeProps) {
  const podium = PODIUM[rank - 1];
  return (
    <span
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-bold tabular-nums",
        podium ? `bg-gradient-to-br text-white shadow-[0_6px_16px_-6px] ring-1 ring-inset ring-white/30 ${podium}` : "bg-[var(--glass-track)] text-muted-foreground",
      )}
    >
      {rank === 1 ? <Crown aria-label="1" className="h-4 w-4" strokeWidth={2.4} /> : rank}
    </span>
  );
}
