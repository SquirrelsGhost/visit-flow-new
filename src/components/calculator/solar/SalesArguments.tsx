import { Coins, Leaf, ShieldCheck, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { eur } from "../../../lib/tariff/eur";
import type { SolarInput, SolarResult } from "../../../lib/solar/solarCalc";
import { solarTexts as t } from "../../../texts/solarTexts";
import { CALC_CARD, CALC_LABEL } from "../calcGlass";

interface SalesArgumentsProps {
  input: SolarInput;
  result: SolarResult;
}

const Em = ({ children }: { children: ReactNode }) => <span className="font-semibold text-foreground">{children}</span>;

const Point = ({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) => (
  <div className="flex items-start gap-2.5">
    <span className="mt-0.5 shrink-0 text-emerald-500">{icon}</span>
    <div>
      <strong className="block text-foreground">{title}</strong>
      {children}
    </div>
  </div>
);

/** Argumente für die Haustür: Inflationsschutz, Eigentum, Klimaschutz, mit Zahlen aus der Rechnung. */
export default function SalesArguments({ input, result }: SalesArgumentsProps) {
  return (
    <div className={`${CALC_CARD} shrink-0 space-y-3.5`}>
      <span className={`flex items-center gap-1.5 ${CALC_LABEL}`}>
        <Sparkles className="h-3.5 w-3.5 motion-safe:animate-pulse" />
        {t.argsTitle}
      </span>
      <div className="space-y-3 text-[13px] leading-relaxed text-muted-foreground">
        <Point icon={<ShieldCheck className="h-4 w-4" />} title={t.inflationTitle}>
          {t.inflationText(input.inflation || 3)}
          <span className="whitespace-nowrap">
            <Em>
              {eur(result.altMonthlyIn20Years)}
              {t.perMonthFull}
            </Em>
          </span>
          {t.inflationEnd}
        </Point>
        <Point icon={<Coins className="h-4 w-4" />} title={t.valueTitle}>
          {input.mode === "miete" ? (
            t.valueRent
          ) : (
            <>
              {t.valueBuy}
              <Em>{t.years(result.amortizationYears)}</Em>.
            </>
          )}
        </Point>
        <Point icon={<Leaf className="h-4 w-4" />} title={t.climateTitle}>
          {t.climateText}
          <Em>{t.tons(result.co2SavingsTons)}</Em>
          {t.climateMid}
          <Em>{t.trees(result.trees)}</Em>
          {t.climateEnd}
        </Point>
      </div>
    </div>
  );
}
