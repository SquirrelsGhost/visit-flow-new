import type { ReactNode } from "react";
import { eur } from "../../../lib/tariff/eur";
import type { SolarInput, SolarResult } from "../../../lib/solar/solarCalc";
import { solarTexts as t } from "../../../texts/solarTexts";
import AnimatedEuro from "../../ui/AnimatedEuro";
import { CALC_CARD, CALC_LABEL } from "../calcGlass";

interface MonthlyBreakdownProps {
  input: SolarInput;
  result: SolarResult;
}

const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex items-center justify-between gap-2 text-foreground/80">
    <span>{label}</span>
    <span className="font-semibold tabular-nums">{children}</span>
  </div>
);

/** Monatsrechnung: Solarrate oder Anschaffung, Reststrom, Einspeisung, netto und Ersparnis. */
export default function MonthlyBreakdown({ input, result }: MonthlyBreakdownProps) {
  const cash = input.mode === "kauf" && !input.financed;
  return (
    <div className={`${CALC_CARD} shrink-0 space-y-3`}>
      <span className={`block ${CALC_LABEL}`}>{t.detail}</span>
      <div className="space-y-2 text-[13px]">
        {cash ? (
          <Row label={t.purchase}>
            <span className="text-blue-600 dark:text-blue-400">
              {eur(result.investmentCost)} {t.once}
            </span>
          </Row>
        ) : (
          <Row label={input.mode === "miete" ? t.rent : t.loan}>
            +{eur(input.mode === "miete" ? result.monthlyRentalRate : result.monthlyFinancingRate)}
          </Row>
        )}
        <Row label={t.grid}>+{eur(result.gridPurchaseMonthly)}</Row>
        <Row label={t.feedInCredit}>
          <span className="text-emerald-600 dark:text-emerald-400">-{eur(result.feedInMonthly)}</span>
        </Row>
        <div className="my-2 h-px bg-[var(--glass-divider)]" />
        <div className="flex items-center justify-between font-bold">
          <span>{t.net}</span>
          <AnimatedEuro value={result.newMonthlyCost} className="tabular-nums" />
        </div>
        <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 px-3 py-2.5 font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-500/25 dark:text-emerald-300">
          <span>{t.savings}</span>
          <span className="tabular-nums">
            {result.monthlySavings > 0 && "+"}
            <AnimatedEuro value={Math.max(0, result.monthlySavings)} suffix={t.perMonthLong} />
          </span>
        </div>
      </div>
    </div>
  );
}
