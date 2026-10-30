// Schieberegler und Rechnung laufen im Browser
"use client";

import { ArrowRight, RotateCcw, Sun } from "lucide-react";
import { useSolarPencilSell } from "../../../hooks/useSolarPencilSell";
import { solarTexts as t } from "../../../texts/solarTexts";
import GlassChip from "../../glass/GlassChip";
import { GLASS_FOOTER } from "../../glass/glassStyles";
import Reveal from "../../ui/Reveal";
import { CALC_LABEL, CALC_SUCCESS } from "../calcGlass";
import CompareCards from "./CompareCards";
import InvestmentBlock from "./InvestmentBlock";
import ModelStep from "./ModelStep";
import MonthlyBreakdown from "./MonthlyBreakdown";
import RoofVisualizer from "./RoofVisualizer";
import SalesArguments from "./SalesArguments";
import SolarHero from "./SolarHero";
import StatTiles from "./StatTiles";
import SystemStep from "./SystemStep";
import TwentyYearBars from "./TwentyYearBars";

/**
 * PV-Vergleich (Grundlage v1 SolarPencilSell) im Glas-Design und wie der Strom- und Gasvergleich aufgebaut:
 * 1 Anlage, 2 Modell & Preise, dann das Ergebnis mit großer Ersparnis und dem Abschluss.
 */
export interface SolarPencilSellProps { readonly _?: never; }

export default function SolarPencilSell() {
  const sell = useSolarPencilSell();
  const { input, result } = sell;
  const cash = input.mode === "kauf" && !input.financed;
  return (
    <div className="mx-auto max-w-5xl space-y-7 pb-6">
      <div className="flex items-center justify-between gap-3 px-1">
        <div className="flex min-w-0 items-center gap-2">
          <GlassChip tone="green">
            <Sun className="h-3 w-3" /> {t.badge}
          </GlassChip>
          <span className="truncate text-[12px] text-[var(--glass-label)]">{t.info}</span>
        </div>
        <button
          type="button"
          onClick={sell.reset}
          className="glass-surface flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-foreground/80 transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
        >
          <RotateCcw className="h-3.5 w-3.5" /> {t.neuStarten}
        </button>
      </div>
      <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
        <SystemStep sell={sell} />
        <div className="space-y-4 lg:space-y-5">
          <ModelStep sell={sell} />
          <RoofVisualizer panels={result.maxPanels} kWp={result.kWp} orientation={input.orientation} />
        </div>
      </div>
      <section aria-label={t.ergebnis} className="space-y-3">
        <span className={`${CALC_LABEL} block px-1`}>{t.ergebnis}</span>
        <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
          <SolarHero input={input} result={result} />
          <div className="space-y-4">
            <CompareCards input={input} result={result} />
            <StatTiles autarky={result.autarkyPercent} co2={result.co2SavingsTons} />
            <button type="button" onClick={sell.book} className={`${CALC_SUCCESS} h-14 text-[15px]`}>
              <span>{t.book(input.mode)}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
          <MonthlyBreakdown input={input} result={result} />
          <div className="space-y-4">
            <Reveal show={cash}>
              <InvestmentBlock cost={result.investmentCost} years={result.amortizationYears} />
            </Reveal>
            <TwentyYearBars result={result} />
          </div>
        </div>
        <SalesArguments input={input} result={result} />
        <p className={GLASS_FOOTER}>{t.sealText}</p>
      </section>
    </div>
  );
}
