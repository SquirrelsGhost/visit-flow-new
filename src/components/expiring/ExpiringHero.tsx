import { Target } from "lucide-react";
import { ALL, type ExpiringContract, type ExpiringStats, type Urgency } from "../../lib/expiring/expiringTypes";
import { expiringTexts as t } from "../../texts/expiringTexts";
import GlassCard from "../glass/GlassCard";
import GlassChip from "../glass/GlassChip";
import GlassNumber from "../glass/GlassNumber";
import GlassStat from "../glass/GlassStat";
import { URGENCY_STYLE } from "./expiringStyles";
import ExpiringTimeline from "./ExpiringTimeline";

interface ExpiringHeroProps {
  stats: ExpiringStats;
  /** Verträge der Filter ohne Dringlichkeit, für die Zeitachse. */
  timeline: readonly ExpiringContract[];
  counts: Record<Urgency, number>;
  urgency: Urgency | typeof ALL;
  window: number;
  demo: boolean;
  onUrgency: (urgency: Urgency | typeof ALL) => void;
}

/**
 * Kopf der Seite als tiefe Karte (v1: lila Statistik-Karte). Anzahl groß, darunter die Zeitachse der nächsten
 * 90 Tage mit den drei Dringlichkeiten als Filter, unten Provision, Durchschnitt und Potenzial.
 */
export default function ExpiringHero({ stats, timeline, counts, urgency, window, demo, onUrgency }: ExpiringHeroProps) {
  const glow = URGENCY_STYLE[urgency === ALL ? (counts.urgent > 0 ? "urgent" : "medium") : urgency].glow;
  return (
    <GlassCard variant="deep" sheen spotlight className="px-5 pb-5 pt-6">
      <span aria-hidden className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full transition-[background] duration-700" style={{ background: `radial-gradient(closest-side, ${glow}, transparent)` }} />
      <div className="relative flex items-start justify-between gap-3">
        <p className="min-w-0 truncate pt-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">{t.eyebrow(window)}</p>
        {demo && (
          <GlassChip tone="amber" onDeep>
            {t.demoBadge}
          </GlassChip>
        )}
      </div>
      <div className="relative mt-4">
        <GlassStat label={t.count} size="hero" onDeep>
          <GlassNumber value={stats.count} />
        </GlassStat>
        <p className="mt-2 text-[13px] text-white/60">{t.soon(stats.byUrgency.urgent)}</p>
      </div>
      <div className="relative mt-5">
        <ExpiringTimeline contracts={timeline} window={window} counts={counts} active={urgency} onPick={onUrgency} />
      </div>
      <div className="relative mt-5 grid grid-cols-3 gap-3 border-t border-white/10 pt-4">
        <GlassStat label={t.commission} onDeep>
          <GlassNumber value={stats.commission} kind="euro" />
        </GlassStat>
        <GlassStat label={t.average} onDeep>
          <GlassNumber value={stats.average} kind="euro" />
        </GlassStat>
        <div className="min-w-0">
          <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-400">
            <Target aria-hidden className="h-3 w-3" />
            {t.potential}
          </span>
          <span className="mt-2 block truncate text-[22px] font-semibold leading-none tracking-[-0.02em] text-white">
            <GlassNumber value={stats.potential} kind="euro" />
          </span>
          <span className="mt-1.5 block truncate text-[11px] text-white/45">{t.potentialHint}</span>
        </div>
      </div>
      {stats.topCategory && <p className="relative mt-3 truncate text-[12px] text-white/50">{t.topCategory(t.categoryLabel(stats.topCategory.category), stats.topCategory.count)}</p>}
    </GlassCard>
  );
}
