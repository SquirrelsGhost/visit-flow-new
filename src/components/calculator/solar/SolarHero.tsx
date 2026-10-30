// Betrag zählt weich hoch, sobald die Karte sichtbar wird
"use client";

import { eur } from "../../../lib/tariff/eur";
import type { SolarInput, SolarResult } from "../../../lib/solar/solarCalc";
import { solarTexts as t } from "../../../texts/solarTexts";
import GlassChip from "../../glass/GlassChip";
import GlassNumber from "../../glass/GlassNumber";
import GlassSheen from "../../glass/GlassSheen";
import GlassStat from "../../glass/GlassStat";
import { CALC_CARD, CALC_DEEP } from "../calcGlass";

interface SolarHeroProps {
  input: SolarInput;
  result: SolarResult;
}

/** Die Ersparnis pro Monat als tiefe Glaskarte, dazu Jahr, 20 Jahre, Autarkie und beim Kauf die Amortisation. */
export default function SolarHero({ input, result }: SolarHeroProps) {
  if (result.monthlySavings <= 0) {
    return (
      <div className={`${CALC_CARD} flex flex-col justify-center p-5`}>
        <div className="text-[19px] font-semibold tracking-[-0.02em]">{t.keinVorteil}</div>
        <p className="mt-1 text-sm text-muted-foreground">{t.keinVorteilText}</p>
      </div>
    );
  }
  const kauf = input.mode === "kauf" && result.amortizationYears > 0;
  return (
    <div className={`${CALC_DEEP} flex flex-col justify-center px-5 pb-5 pt-6 md:px-6`}>
      <span aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-400/25 via-transparent to-transparent" />
      <GlassSheen />
      <GlassStat label={t.heroLabel} size="hero" onDeep className="relative">
        <GlassNumber value={result.monthlySavings} kind="euro" />
      </GlassStat>
      <p className="relative mt-2 text-[14px] text-white/65">{t.heroJahr(eur(Math.round(result.monthlySavings * 12)))}</p>
      <div className="relative mt-4 flex flex-wrap gap-1.5">
        {result.totalSavings20Years > 0 && (
          <GlassChip tone="green" onDeep>
            {t.chip20(eur(result.totalSavings20Years))}
          </GlassChip>
        )}
        <GlassChip tone="blue" onDeep>
          {t.chipAutarkie(result.autarkyPercent)}
        </GlassChip>
        {kauf && (
          <GlassChip tone="amber" onDeep>
            {t.chipAmortisation(t.years(result.amortizationYears))}
          </GlassChip>
        )}
      </div>
    </div>
  );
}
