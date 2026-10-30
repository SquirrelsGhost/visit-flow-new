import type { DayStats } from "../../lib/battle/arenaScore";
import { shareOfBest } from "../../lib/battle/duel";
import { cn } from "../../lib/cn";
import { battleTexts as t } from "../../texts/battleTexts";
import GlassNumber from "../glass/GlassNumber";
import GlassProgress from "../glass/GlassProgress";

interface TopTodayRowProps {
  rank: number;
  name: string;
  stats: DayStats;
  best: number;
  me: boolean;
}

/** Medaillen-Plaketten für Platz 1 bis 3, danach schlichte Zahl. */
const MEDAL = [
  "bg-gradient-to-br from-yellow-200 via-amber-400 to-amber-600 text-amber-950 shadow-[0_6px_14px_-6px_rgba(245,158,11,0.9)]",
  "bg-gradient-to-br from-white via-slate-200 to-slate-400 text-slate-700 shadow-[0_6px_14px_-6px_rgba(100,116,139,0.8)]",
  "bg-gradient-to-br from-orange-200 via-orange-400 to-orange-700 text-orange-950 shadow-[0_6px_14px_-6px_rgba(234,88,12,0.8)]",
] as const;
const PLAIN = "bg-[var(--glass-track)] text-slate-500 dark:text-white/60";

/** Platz in der Tagesrangliste: Medaille, Name, Sales, Provision und Balken zum Ersten. */
export default function TopTodayRow({ rank, name, stats, best, me }: TopTodayRowProps) {
  return (
    <div className={cn("flex items-center gap-3.5 px-4 py-3", me && "bg-red-500/[0.05]")}>
      <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[14px] font-bold ring-1 ring-inset ring-white/40", MEDAL[rank] ?? PLAIN)}>{rank + 1}</span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2">
          <span className="truncate text-[15px] font-semibold text-foreground">
            {name}
            {me && <span className="ml-1.5 text-[11px] font-semibold text-red-600 dark:text-red-300">{t.you}</span>}
          </span>
          <GlassNumber value={stats.commission} kind="euro" duration={1.2} className={cn("shrink-0 text-[15px] font-semibold", rank === 0 ? "text-amber-600 dark:text-amber-300" : "text-foreground")} />
        </span>
        <span className="mt-1.5 flex items-center gap-2.5">
          <GlassProgress share={shareOfBest(stats.commission, best)} tone={rank === 0 ? "amber" : "red"} label={name} now={Math.round(stats.commission)} max={Math.round(best)} className="flex-1" />
          <span className="shrink-0 text-[11.5px] text-muted-foreground tabular-nums">{t.sales(stats.sales)}</span>
        </span>
      </span>
    </div>
  );
}
