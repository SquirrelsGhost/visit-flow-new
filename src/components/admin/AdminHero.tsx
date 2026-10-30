import type { Vertical } from "../../lib/battle/battleCategories";
import type { AdminFigures } from "../../lib/admin/adminTypes";
import { VERTICAL_OPTIONS } from "../../lib/navigation/verticals";
import { formatDay } from "../../lib/overview/todayFormat";
import { adminTexts } from "../../texts/adminTexts";
import { overviewTexts } from "../../texts/overviewTexts";
import { fill } from "../../texts/profileTexts";
import GlassCard from "../glass/GlassCard";
import GlassChip from "../glass/GlassChip";
import GlassNumber from "../glass/GlassNumber";
import GlassStat from "../glass/GlassStat";

interface AdminHeroProps {
  figures: AdminFigures;
  people: number;
  vertical: Vertical;
  demo: boolean;
  now: Date;
}

const texts = adminTexts.hero;

/** Kopf des Dashboards über beide Spalten: Abschlüsse heute groß, darunter Aktive, Monat und Provision. */
export default function AdminHero({ figures, people, vertical, demo, now }: AdminHeroProps) {
  const sparte = VERTICAL_OPTIONS.find((option) => option.id === vertical)?.label ?? vertical;
  const { salesToday, month } = figures;
  return (
    <GlassCard variant="deep" sheen spotlight className="px-5 pb-5 pt-6 lg:px-7 lg:pt-7">
      <span aria-hidden className="pointer-events-none absolute -left-16 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(closest-side,rgba(249,115,22,0.3),transparent)]" />
      <span aria-hidden className="pointer-events-none absolute -bottom-28 right-[-2.5rem] h-64 w-64 rounded-full bg-[radial-gradient(closest-side,rgba(99,102,241,0.3),transparent)]" />
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
      <div className="relative lg:flex lg:items-end lg:justify-between lg:gap-8">
        <div className="min-w-0">
          <div className="mt-4 flex items-baseline gap-2">
            <GlassNumber value={salesToday} className="glass-text-shine text-[56px] font-semibold leading-none tracking-[-0.04em] lg:text-[64px]" />
            <span className="text-[17px] font-medium text-white/60">{salesToday === 1 ? texts.salesOne : texts.sales}</span>
          </div>
          <p className="mt-2 text-[13px] text-white/55">{fill(texts.line, { doors: figures.doorsToday, conversion: figures.conversion, yesterday: figures.salesYesterday })}</p>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3 border-t border-white/10 pt-5 lg:mt-0 lg:w-[30rem] lg:shrink-0 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
          <GlassStat label={texts.active} onDeep>
            <GlassNumber value={figures.activeToday} />
            <span className="ml-1 text-[13px] font-medium text-white/45">/ {people}</span>
          </GlassStat>
          <GlassStat label={texts.month} onDeep>
            <GlassNumber value={month.sales} />
          </GlassStat>
          <GlassStat label={texts.commission} onDeep>
            <GlassNumber value={Math.round(month.commission)} />
            <span className="ml-1 text-[15px] font-medium text-white/55">€</span>
          </GlassStat>
        </div>
      </div>
    </GlassCard>
  );
}
