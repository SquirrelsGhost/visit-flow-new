import type { Vertical } from "../../lib/battle/battleCategories";
import { VERTICAL_OPTIONS } from "../../lib/navigation/verticals";
import { changeOf, type PerformanceTotals, type Period } from "../../lib/team/teamPerformance";
import { fill } from "../../texts/profileTexts";
import { teamPerformanceTexts as texts } from "../../texts/teamPerformanceTexts";
import GlassCard from "../glass/GlassCard";
import GlassChip from "../glass/GlassChip";
import GlassNumber from "../glass/GlassNumber";
import DeltaChip from "./DeltaChip";
import HeroMetric from "./HeroMetric";

interface PerformanceHeroProps {
  current: PerformanceTotals;
  previous: PerformanceTotals;
  period: Period;
  vertical: Vertical;
  /** true = ohne Team: Mentees plus man selbst (v1 teamId "none"). */
  mentees: boolean;
  demo: boolean;
}

/** Kopf der Teamleistung als tiefe Karte: Umsatz des Zeitraums groß wie ein Kontostand, darunter Türen, Sales und Quote. */
export default function PerformanceHero({ current, previous, period, vertical, mentees, demo }: PerformanceHeroProps) {
  const sparte = VERTICAL_OPTIONS.find((option) => option.id === vertical)?.label ?? vertical;
  const revenueChange = changeOf(current.umsatz, previous.umsatz);
  return (
    <GlassCard variant="deep" sheen spotlight className="px-5 pb-4 pt-6">
      <span aria-hidden className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(closest-side,rgba(129,140,248,0.4),transparent)]" />
      <div className="relative flex items-start justify-between gap-3">
        <p className="min-w-0 truncate pt-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
          {fill(texts.lastDays, { days: period })}
        </p>
        <div className="flex shrink-0 gap-1.5">
          <GlassChip onDeep>{sparte}</GlassChip>
          {demo && (
            <GlassChip tone="amber" onDeep>
              {texts.demoBadge}
            </GlassChip>
          )}
        </div>
      </div>
      <p className="relative mt-5 text-[12px] font-semibold uppercase tracking-[0.16em] text-white/55">
        {texts.revenue} · {mentees ? texts.scopeMentees : texts.scopeTeam}
      </p>
      <GlassNumber value={current.umsatz} kind="euro" duration={1.6} className="glass-text-shine relative mt-1.5 text-[46px] font-semibold leading-none tracking-[-0.04em] min-[400px]:text-[52px]" />
      <div className="relative mt-3 flex min-h-6 flex-wrap items-center gap-2">
        {revenueChange === null ? (
          <span className="text-[12.5px] text-white/50">{texts.revenueHint}</span>
        ) : (
          <DeltaChip change={revenueChange} suffix={` ${fill(texts.vsBefore, { days: period })}`} />
        )}
      </div>
      <div className="relative mt-5 grid grid-cols-3 gap-3 border-t border-white/10 pt-4">
        <HeroMetric label={texts.visits} value={current.visits} change={changeOf(current.visits, previous.visits)} />
        <HeroMetric label={texts.sales[vertical]} value={current.sales} change={changeOf(current.sales, previous.sales)} />
        <HeroMetric label={texts.closeRate} value={current.closeRate} kind="percent" change={changeOf(current.closeRate, previous.closeRate)} />
      </div>
    </GlassCard>
  );
}
