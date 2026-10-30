import type { StructureLens } from "../../../lib/overview/structureLogic";
import { formatDay } from "../../../lib/overview/todayFormat";
import { fill } from "../../../texts/profileTexts";
import { overviewTexts } from "../../../texts/overviewTexts";
import { structureTexts as texts } from "../../../texts/structureTexts";
import GlassCard from "../../glass/GlassCard";
import GlassChip from "../../glass/GlassChip";
import GlassNumber from "../../glass/GlassNumber";
import GlassStat from "../../glass/GlassStat";

interface StructureHeroProps {
  lens: StructureLens;
  today: { sales: number; doors: number };
  week: number;
  month: number;
  people: number;
  leadName?: string;
  demo: boolean;
  now: Date;
}

/** Kopf der Struktur als tiefe Karte: Abschlüsse der Gruppe heute groß, darunter Woche, Monat, Köpfe. */
export default function StructureHero({ lens, today, week, month, people, leadName, demo, now }: StructureHeroProps) {
  const conversion = today.doors > 0 ? Math.round((today.sales / today.doors) * 100) : 0;
  return (
    <GlassCard variant="deep" sheen spotlight className="px-5 pb-5 pt-6">
      <span aria-hidden className="pointer-events-none absolute -right-14 -top-24 h-60 w-60 rounded-full bg-[radial-gradient(closest-side,rgba(168,85,247,0.32),transparent)]" />
      <span aria-hidden className="pointer-events-none absolute -bottom-24 -left-10 h-56 w-56 rounded-full bg-[radial-gradient(closest-side,rgba(239,68,68,0.26),transparent)]" />
      <div className="relative flex items-start justify-between gap-3">
        <p className="min-w-0 truncate pt-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
          <span className="text-white/80">{texts.eyebrow[lens]}</span> · {formatDay(now)}
        </p>
        <div className="flex shrink-0 gap-1.5">
          {leadName && <GlassChip onDeep>{leadName}</GlassChip>}
          {demo && (
            <GlassChip tone="amber" onDeep>
              {overviewTexts.demoBadge}
            </GlassChip>
          )}
        </div>
      </div>
      <div className="relative mt-4 flex items-baseline gap-2">
        <GlassNumber value={today.sales} className="glass-text-shine text-[56px] font-semibold leading-none tracking-[-0.04em]" />
        <span className="text-[17px] font-medium text-white/60">{today.sales === 1 ? texts.salesOne : texts.sales}</span>
      </div>
      <p className="relative mt-2 text-[13px] text-white/55">{fill(texts.line, { doors: today.doors, conversion })}</p>
      <div className="relative mt-6 grid grid-cols-3 gap-3 border-t border-white/10 pt-5">
        <GlassStat label={texts.week} onDeep>
          <GlassNumber value={week} />
        </GlassStat>
        <GlassStat label={texts.month} onDeep>
          <GlassNumber value={month} />
        </GlassStat>
        <GlassStat label={texts.people[lens]} onDeep>
          <GlassNumber value={people} />
        </GlassStat>
      </div>
    </GlassCard>
  );
}
