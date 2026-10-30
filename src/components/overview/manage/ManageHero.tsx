import type { Vertical } from "../../../lib/battle/battleCategories";
import { VERTICAL_OPTIONS } from "../../../lib/navigation/verticals";
import type { TeamPulse } from "../../../lib/overview/manageLogic";
import { formatDay } from "../../../lib/overview/todayFormat";
import { fill } from "../../../texts/profileTexts";
import { manageTexts } from "../../../texts/manageTexts";
import { overviewTexts } from "../../../texts/overviewTexts";
import GlassCard from "../../glass/GlassCard";
import GlassChip from "../../glass/GlassChip";
import GlassNumber from "../../glass/GlassNumber";
import GlassStat from "../../glass/GlassStat";

interface ManageHeroProps {
  pulse: TeamPulse;
  vertical: Vertical;
  demo: boolean;
  now: Date;
}

const texts = manageTexts.hero;

/** Kopf der Verwaltung als tiefe Karte: Abschlüsse des Teams heute groß, darunter wer im Einsatz ist. */
export default function ManageHero({ pulse, vertical, demo, now }: ManageHeroProps) {
  const sparte = VERTICAL_OPTIONS.find((option) => option.id === vertical)?.label ?? vertical;
  return (
    <GlassCard variant="deep" sheen spotlight className="px-5 pb-5 pt-6">
      <span aria-hidden className="pointer-events-none absolute -left-16 -top-24 h-60 w-60 rounded-full bg-[radial-gradient(closest-side,rgba(99,102,241,0.32),transparent)]" />
      <span aria-hidden className="pointer-events-none absolute -bottom-24 -right-10 h-56 w-56 rounded-full bg-[radial-gradient(closest-side,rgba(239,68,68,0.28),transparent)]" />
      <div className="relative flex items-start justify-between gap-3">
        <p className="min-w-0 truncate pt-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
          <span className="text-white/80">{texts.eyebrow}</span> · {formatDay(now)}
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
        <GlassNumber value={pulse.salesToday} className="glass-text-shine text-[56px] font-semibold leading-none tracking-[-0.04em]" />
        <span className="text-[17px] font-medium text-white/60">{pulse.salesToday === 1 ? texts.salesOne : texts.sales}</span>
      </div>
      <p className="relative mt-2 text-[13px] text-white/55">{fill(texts.line, { doors: pulse.doorsToday, conversion: pulse.conversion, month: pulse.salesMonth })}</p>
      <div className="relative mt-6 grid grid-cols-3 gap-3 border-t border-white/10 pt-5">
        <GlassStat label={texts.working} onDeep>
          <GlassNumber value={pulse.working} />
        </GlassStat>
        <GlassStat label={texts.out} onDeep>
          <span className={pulse.out > 0 ? "text-rose-300" : undefined}>
            <GlassNumber value={pulse.out} />
          </span>
        </GlassStat>
        <GlassStat label={texts.members} onDeep>
          <GlassNumber value={pulse.members} />
        </GlassStat>
      </div>
    </GlassCard>
  );
}
