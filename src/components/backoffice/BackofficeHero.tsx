import { CheckCircle2 } from "lucide-react";
import { cn } from "../../lib/cn";
import type { BackofficeStats } from "../../lib/backoffice/backofficeTypes";
import { STORNO_LIMIT } from "../../lib/crm/crmLogic";
import { formatEuro } from "../../lib/crm/crmFormat";
import { backofficeTexts as t } from "../../texts/backofficeTexts";
import GlassCard from "../glass/GlassCard";
import GlassChip from "../glass/GlassChip";
import GlassNumber from "../glass/GlassNumber";
import GlassStat from "../glass/GlassStat";

interface BackofficeHeroProps {
  stats: BackofficeStats;
  admin: boolean;
  demo: boolean;
  onShowOpen: () => void;
}

/** Kopf als tiefe Karte: offene Verkäufe groß (der Arbeitsstapel), darunter Bestätigt, Storniert und die Monatsquote. */
export default function BackofficeHero({ stats, admin, demo, onShowOpen }: BackofficeHeroProps) {
  const over = stats.quote !== null && stats.quote > STORNO_LIMIT;
  const calm = stats.open === 0;
  return (
    <GlassCard variant="deep" sheen spotlight className="px-5 pb-5 pt-6">
      <span
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full transition-[background] duration-700"
        style={{ background: `radial-gradient(closest-side, ${calm ? "rgba(16,185,129,0.4)" : "rgba(245,158,11,0.42)"}, transparent)` }}
      />
      <div className="relative flex items-start justify-between gap-3">
        <p className="min-w-0 truncate pt-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">{admin ? t.eyebrowAdmin : t.eyebrow}</p>
        {demo && (
          <GlassChip tone="amber" onDeep>
            {t.demoBadge}
          </GlassChip>
        )}
      </div>
      <button type="button" onClick={onShowOpen} className="relative mt-4 block w-full text-left">
        <GlassStat label={t.openLabel} size="hero" onDeep>
          <GlassNumber value={stats.open} />
        </GlassStat>
        <p className="mt-2 flex items-center gap-1.5 text-[13px] text-white/60">
          {calm && <CheckCircle2 aria-hidden className="h-4 w-4 text-emerald-300" />}
          {calm ? t.nothingOpen : t.openCommission(formatEuro(stats.openCommission))}
        </p>
      </button>
      <div className="relative mt-5 grid grid-cols-3 gap-3 border-t border-white/10 pt-4">
        <GlassStat label={t.completed} onDeep>
          <GlassNumber value={stats.completed} />
        </GlassStat>
        <GlassStat label={t.cancelled} onDeep>
          <GlassNumber value={stats.cancelled} />
        </GlassStat>
        <GlassStat label={t.quote} onDeep>
          <span className={cn(over && "text-red-300")}>{stats.quote === null ? t.quoteNone : <GlassNumber value={stats.quote} kind="percent" />}</span>
        </GlassStat>
      </div>
    </GlassCard>
  );
}
