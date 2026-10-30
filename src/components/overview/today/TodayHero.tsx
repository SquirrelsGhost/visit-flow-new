import type { Vertical } from "../../../lib/battle/battleCategories";
import { VERTICAL_OPTIONS } from "../../../lib/navigation/verticals";
import { formatDay, formatTime } from "../../../lib/overview/todayFormat";
import type { TodayStats } from "../../../lib/overview/todayStats";
import { fill } from "../../../texts/profileTexts";
import { overviewTexts } from "../../../texts/overviewTexts";
import GlassCard from "../../glass/GlassCard";
import GlassChip from "../../glass/GlassChip";
import GlassNumber from "../../glass/GlassNumber";
import QuotaRing from "./QuotaRing";

interface TodayHeroProps {
  stats: TodayStats;
  vertical: Vertical;
  demo: boolean;
}

const texts = overviewTexts.today;
const HIT_STOPS = ["#38bdf8", "#6366f1"] as const;
const SALES_STOPS = ["#34d399", "#10b981"] as const;

function timeLine(stats: TodayStats): string {
  if (stats.firstAt === undefined || stats.lastAt === undefined) return texts.none;
  return fill(texts.since, { time: formatTime(stats.firstAt), last: formatTime(stats.lastAt) });
}

/** Kopf der Übersicht als tiefe Karte: Türen von heute groß wie ein Kontostand, darunter die beiden Quoten als Ringe. */
export default function TodayHero({ stats, vertical, demo }: TodayHeroProps) {
  const sparte = VERTICAL_OPTIONS.find((option) => option.id === vertical)?.label ?? vertical;
  return (
    <GlassCard variant="deep" sheen spotlight className="px-5 pb-5 pt-6">
      <span aria-hidden className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[radial-gradient(closest-side,rgba(239,68,68,0.35),transparent)]" />
      <div className="relative flex items-start justify-between gap-3">
        <p className="min-w-0 truncate pt-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
          <span className="text-white/80">{texts.eyebrow}</span> · {formatDay(new Date())}
        </p>
        <div className="flex shrink-0 gap-1.5">
          <GlassChip onDeep>{sparte}</GlassChip>
          {demo && (
            <GlassChip tone="amber" onDeep>
              {overviewTexts.demoBadge}
            </GlassChip>
          )}
        </div>
      </div>
      <div className="relative mt-4 flex items-baseline gap-2">
        <GlassNumber value={stats.doors} className="glass-text-shine text-[56px] font-semibold leading-none tracking-[-0.04em]" />
        <span className="text-[17px] font-medium text-white/60">{stats.doors === 1 ? texts.doorsOne : texts.doors}</span>
      </div>
      <p className="relative mt-2 text-[13px] text-white/55">{timeLine(stats)}</p>
      <div className="relative mt-6 grid grid-cols-2 gap-3 border-t border-white/10 pt-5">
        <QuotaRing label={texts.hitRate} value={stats.hitRate} stops={HIT_STOPS} />
        <QuotaRing label={texts.salesRate[vertical]} value={stats.salesRate} stops={SALES_STOPS} />
      </div>
    </GlassCard>
  );
}
