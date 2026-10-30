import { AlertTriangle } from "lucide-react";
import { cn } from "../../lib/cn";
import type { OverviewStats } from "../../lib/crmOverview/overviewTypes";
import { crmOverviewTexts as t } from "../../texts/crmOverviewTexts";
import GlassCard from "../glass/GlassCard";
import GlassChip from "../glass/GlassChip";
import GlassNumber from "../glass/GlassNumber";
import GlassStat from "../glass/GlassStat";

interface OverviewHeroProps {
  stats: OverviewStats;
  rangeLabel: string;
  demo: boolean;
  onlyIssues: boolean;
  onShowIssues: () => void;
}

/**
 * Kopf der CRM-Übersicht als tiefe Karte (v1: vier Kennzahl-Kacheln). Provision groß, darunter Verkäufe,
 * Kunden und aktive Nutzer; Verkäufe mit Problemen leuchten rot und filtern auf Tippen.
 */
export default function OverviewHero({ stats, rangeLabel, demo, onlyIssues, onShowIssues }: OverviewHeroProps) {
  const issues = stats.issues > 0;
  return (
    <GlassCard variant="deep" sheen spotlight className="px-5 pb-5 pt-6">
      <span
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full transition-[background] duration-700"
        style={{ background: `radial-gradient(closest-side, ${issues ? "rgba(244,63,94,0.42)" : "rgba(168,85,247,0.4)"}, transparent)` }}
      />
      <div className="relative flex items-start justify-between gap-3">
        <p className="min-w-0 truncate pt-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
          {t.eyebrow} · {rangeLabel}
        </p>
        {demo && (
          <GlassChip tone="amber" onDeep>
            {t.demoBadge}
          </GlassChip>
        )}
      </div>
      <div className="relative mt-4">
        <GlassStat label={t.commission} size="hero" onDeep>
          <GlassNumber value={stats.commission} kind="euro" />
        </GlassStat>
        <p className="mt-2 text-[13px] text-white/60">{stats.stornos > 0 ? `${t.stornos(stats.stornos)} nicht eingerechnet` : t.productCount(stats.sales)}</p>
      </div>
      <div className="relative mt-5 grid grid-cols-3 gap-3 border-t border-white/10 pt-4">
        <GlassStat label={t.sales} onDeep>
          <GlassNumber value={stats.sales} />
        </GlassStat>
        <GlassStat label={t.customers} onDeep>
          <GlassNumber value={stats.customers} />
        </GlassStat>
        <GlassStat label={t.activeUsers} onDeep>
          <GlassNumber value={stats.activeUsers} />
        </GlassStat>
      </div>
      <button
        type="button"
        onClick={onShowIssues}
        disabled={!issues}
        aria-pressed={onlyIssues}
        className={cn(
          "relative mt-4 flex w-full items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-left text-[13px] font-medium ring-1 ring-inset transition-[background-color,transform] duration-300 active:scale-[0.99] disabled:cursor-default motion-reduce:transition-none",
          issues ? "bg-red-500/15 text-red-100 ring-red-300/25 hover:bg-red-500/25" : "bg-white/[0.06] text-white/60 ring-white/10",
        )}
      >
        <AlertTriangle aria-hidden className={cn("h-4 w-4 shrink-0", issues ? "text-red-300" : "text-white/40")} />
        <span className="min-w-0 flex-1 truncate">{t.issues(stats.issues)}</span>
        {issues && <span className="shrink-0 text-[12px] font-semibold text-red-200/80">{onlyIssues ? "✓" : t.showIssues}</span>}
      </button>
    </GlassCard>
  );
}
