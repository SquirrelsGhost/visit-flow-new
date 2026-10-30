// Betrag zählt weich hoch, sobald die Karte sichtbar wird
"use client";

import type { Ergebnis } from "../../../lib/energy/energyCalc";
import { formatEuro } from "../../../lib/energy/energyNumbers";
import { energyTexts as t } from "../../../texts/energyTexts";
import GlassChip from "../../glass/GlassChip";
import GlassNumber from "../../glass/GlassNumber";
import GlassSheen from "../../glass/GlassSheen";
import GlassStat from "../../glass/GlassStat";
import { CALC_CARD, CALC_DEEP } from "../calcGlass";

interface ResultHeroProps {
  e: Ergebnis;
}

/** Die Ersparnis als tiefe Glaskarte: 1. Jahr groß, pro Monat, ab Jahr 2, Preisgarantie, geschenkte Monate. Ohne Vorteil ehrlich hell. */
export default function ResultHero({ e }: ResultHeroProps) {
  if (e.ersparnisJahr1Cent <= 0) {
    return (
      <div className={`${CALC_CARD} flex flex-col justify-center p-5`}>
        <div className="text-[19px] font-semibold tracking-[-0.02em]">{t.keinVorteil}</div>
        <p className="mt-1 text-sm text-muted-foreground">{t.teurer(formatEuro(-e.ersparnisJahr1Cent))}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{t.andererTarif}</p>
      </div>
    );
  }
  // Garantie nur, wenn sie mehr sagt als das 1. Jahr (bei 12 Monaten ohne Bonus ist es derselbe Betrag)
  const garantie =
    e.ersparnisGarantieCent !== null && e.ersparnisGarantieCent > e.ersparnisJahr1Cent && e.preisgarantieMonate;
  return (
    <div className={`${CALC_DEEP} flex flex-col justify-center px-5 pb-5 pt-6 md:px-6`}>
      <span aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-400/25 via-transparent to-transparent" />
      <GlassSheen />
      <div className="relative flex items-start justify-between gap-2">
        <GlassStat label={t.ersparnis(false)} size="hero" onDeep>
          <GlassNumber value={e.ersparnisJahr1Cent / 100} kind="euro" />
        </GlassStat>
        {e.geschaetzt && (
          <GlassChip tone="amber" onDeep>
            {t.geschaetzt}
          </GlassChip>
        )}
      </div>
      <p className="relative mt-2 text-[14px] text-white/65">{t.proMonat(formatEuro(Math.round(e.ersparnisJahr1Cent / 12)))}</p>
      <div className="relative mt-4 flex flex-wrap gap-1.5">
        {e.bonusCent > 0 && e.ersparnisAbJahr2Cent > 0 && (
          <GlassChip tone="green" onDeep>
            {formatEuro(e.ersparnisAbJahr2Cent)} {t.abJahr2}
          </GlassChip>
        )}
        {garantie && (
          <GlassChip tone="blue" onDeep>
            {formatEuro(e.ersparnisGarantieCent ?? 0)} {t.garantieFakt(e.preisgarantieMonate ?? 0)}
          </GlassChip>
        )}
        {e.monateGeschenkt >= 1 && (
          <GlassChip tone="amber" onDeep>
            {t.geschenkt(e.monateGeschenkt)}
          </GlassChip>
        )}
      </div>
    </div>
  );
}
