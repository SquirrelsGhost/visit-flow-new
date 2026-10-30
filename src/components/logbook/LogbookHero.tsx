import { Lock } from "lucide-react";
import type { SyncStatus } from "../../lib/logbook/logbookSyncRunner";
import type { DayBar } from "../../lib/logbook/logbookLogic";
import { formatEuro, formatKm } from "../../lib/logbook/logbookFormat";
import type { MonthSummary } from "../../lib/logbook/logbookTypes";
import type { LogbookTexts } from "../../texts/logbook/logbookTexts";
import GlassCard from "../glass/GlassCard";
import GlassChip from "../glass/GlassChip";
import GlassNumber from "../glass/GlassNumber";
import GlassStat from "../glass/GlassStat";
import DailyBars from "./DailyBars";
import KindSplit from "./KindSplit";
import LogbookMonthSwitch from "./LogbookMonthSwitch";
import LogbookSyncChip from "./LogbookSyncChip";

interface LogbookHeroProps {
  t: LogbookTexts;
  monthLabel: string;
  dir: number;
  atLatest: boolean;
  onPrev: () => void;
  onNext: () => void;
  summary: MonthSummary;
  yearToDate: MonthSummary;
  bars: readonly DayBar[];
  today: number | null;
  odometer?: number;
  locked: boolean;
  demo: boolean;
  sync: SyncStatus;
}

/**
 * Kopf des Fahrtenbuchs als tiefe Karte (v1 MonthSummaryCard): Monat wählen, Kilometer groß, Anteile je Fahrtart,
 * Tagesverlauf, darunter Fahrten, Fahrtage und die Kilometerpauschale der Dienstfahrten.
 */
export default function LogbookHero(p: LogbookHeroProps) {
  const { t, summary } = p;
  return (
    <GlassCard variant="deep" sheen spotlight className="px-5 pb-5 pt-5">
      <span aria-hidden className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(closest-side,rgba(56,189,248,0.32),transparent)]" />
      <div className="relative flex items-center justify-between gap-3">
        <LogbookMonthSwitch label={p.monthLabel} dir={p.dir} atLatest={p.atLatest} onPrev={p.onPrev} onNext={p.onNext} navLabel={t.monthNav} prevLabel={t.prevMonth} nextLabel={t.nextMonth} />
        <div className="flex shrink-0 gap-1.5">
          {p.locked && (
            <GlassChip tone="green" onDeep>
              <Lock aria-hidden className="h-3 w-3" />
              {t.lockedBadge}
            </GlassChip>
          )}
          <LogbookSyncChip status={p.sync} t={t} />
          {p.demo && (
            <GlassChip tone="amber" onDeep>
              {t.demoBadge}
            </GlassChip>
          )}
        </div>
      </div>
      <div className="relative mt-5">
        <GlassStat label={t.driven} size="hero" onDeep>
          <GlassNumber value={summary.totalKm} />
          <span className="ml-1.5 text-[22px] font-semibold tracking-normal text-white/50">km</span>
        </GlassStat>
        <p className="mt-2 truncate text-[13px] text-white/60">
          {[t.businessShare(Math.round(summary.businessShare * 100)), p.odometer !== undefined ? t.odometer(formatKm(p.odometer, t)) : ""].filter(Boolean).join(" · ")}
        </p>
      </div>
      <div className="relative mt-5">
        <KindSplit totals={summary.byKind} t={t} />
      </div>
      <div className="relative mt-5">
        <DailyBars bars={p.bars} today={p.today} t={t} />
      </div>
      <div className="relative mt-5 grid grid-cols-3 gap-3 border-t border-white/10 pt-4">
        <GlassStat label={t.trips} onDeep>
          <GlassNumber value={summary.trips} />
        </GlassStat>
        <GlassStat label={t.days} onDeep>
          <GlassNumber value={summary.days} />
        </GlassStat>
        <div className="min-w-0">
          <GlassStat label={t.allowance} onDeep>
            <GlassNumber value={summary.allowance} kind="euro" />
          </GlassStat>
          <span className="mt-1.5 block truncate text-[11px] text-white/45">{t.allowanceHint}</span>
        </div>
      </div>
      <p className="relative mt-3 truncate text-[12px] text-white/50">{t.yearToDate(formatKm(p.yearToDate.byKind.business, t), formatEuro(p.yearToDate.allowance, t))}</p>
    </GlassCard>
  );
}
