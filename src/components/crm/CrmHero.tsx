import type { Vertical } from "../../lib/battle/battleCategories";
import { salesToRecover, STORNO_BONUS, STORNO_LIMIT, stornoBuffer, stornoOk } from "../../lib/crm/crmLogic";
import { currentMonthLabel } from "../../lib/crm/crmFormat";
import type { MonthCounts } from "../../lib/crm/crmTypes";
import { crmTexts as t } from "../../texts/crmTexts";
import GlassCard from "../glass/GlassCard";
import GlassChip from "../glass/GlassChip";
import GlassNumber from "../glass/GlassNumber";
import GlassStat from "../glass/GlassStat";
import QuoteGauge from "./QuoteGauge";

interface CrmHeroProps {
  counts: MonthCounts;
  vertical: Vertical;
  demo: boolean;
  /** Vodafone-Vertragsmonat (nur Telco), null ohne Vertragsstart. */
  contractMonth: number | null;
}

function subline(counts: MonthCounts, vertical: Vertical, ok: boolean): string {
  if (counts.quote === null) return t.quoteEmpty;
  if (vertical !== "telco") return t.split(counts.stornos, counts.sales + counts.stornos, t.orders[vertical]);
  return ok ? t.buffer(stornoBuffer(counts)) : t.recover(salesToRecover(counts));
}

/** Licht oben rechts: grün/rot an der Bonus-Grenze (Telco), sonst neutral blau. */
const glow = (telco: boolean, ok: boolean) => (!telco ? "rgba(59,130,246,0.38)" : ok ? "rgba(16,185,129,0.4)" : "rgba(244,63,94,0.45)");

/**
 * Kopf der Aufträge als tiefe Karte (v1 "Diesen Monat"-Karte mit Sales und Stornos): Stornoquote groß,
 * Leiste mit Bonus-Grenze, darunter Sales, Stornos und Provision. Das Licht wird rot, wenn die Quote kippt.
 */
export default function CrmHero({ counts, vertical, demo, contractMonth }: CrmHeroProps) {
  const ok = stornoOk(counts.quote);
  const telco = vertical === "telco";
  return (
    <GlassCard variant="deep" sheen spotlight className="px-5 pb-5 pt-6">
      <span
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full transition-[background] duration-700"
        style={{ background: `radial-gradient(closest-side, ${glow(telco, ok)}, transparent)` }}
      />
      <div className="relative flex items-start justify-between gap-3">
        <p className="min-w-0 truncate pt-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">{t.thisMonth(currentMonthLabel())}</p>
        {demo && (
          <GlassChip tone="amber" onDeep>
            {t.demoBadge}
          </GlassChip>
        )}
      </div>
      <div className="relative mt-4">
        <GlassStat label={t.quote} size="hero" onDeep>
          {counts.quote === null ? "–" : <GlassNumber value={counts.quote} kind="percent" />}
        </GlassStat>
        <p className="mt-2 text-[13px] text-white/60">{subline(counts, vertical, ok)}</p>
        {telco && <QuoteGauge quote={counts.quote} />}
      </div>
      <div className="relative mt-5 grid grid-cols-3 gap-3 border-t border-white/10 pt-4">
        <GlassStat label={t.orders[vertical]} onDeep>
          <GlassNumber value={counts.sales} />
        </GlassStat>
        <GlassStat label={t.stornos} onDeep>
          <span className={counts.stornos > 0 ? "text-rose-300" : undefined}>
            <GlassNumber value={counts.stornos} />
          </span>
        </GlassStat>
        <GlassStat label={t.commission} onDeep>
          <GlassNumber value={counts.commission} kind="euro" />
        </GlassStat>
      </div>
      {telco && (
        <div className="relative mt-4 flex flex-wrap gap-1.5">
          <GlassChip tone={ok ? "green" : "red"} onDeep>
            {ok ? t.bonusOk(STORNO_LIMIT, STORNO_BONUS) : t.bonusLost(STORNO_LIMIT)}
          </GlassChip>
          {contractMonth !== null && (
            <GlassChip tone={contractMonth >= 5 ? "blue" : "slate"} onDeep>
              {contractMonth >= 5 ? t.contractMonth(contractMonth) : `${t.contractMonth(contractMonth)} · ${t.bonusFromMonth}`}
            </GlassChip>
          )}
        </div>
      )}
    </GlassCard>
  );
}
