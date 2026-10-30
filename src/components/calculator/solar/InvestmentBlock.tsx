import { eur } from "../../../lib/tariff/eur";
import { solarTexts as t } from "../../../texts/solarTexts";
import { CALC_CARD, CALC_LABEL } from "../calcGlass";

interface InvestmentBlockProps {
  cost: number;
  years: number;
}

/** Nur beim Direktkauf: Anschaffung und Amortisation. */
export default function InvestmentBlock({ cost, years }: InvestmentBlockProps) {
  return (
    <div className={`${CALC_CARD} shrink-0 text-center`}>
      <span className={`block ${CALC_LABEL}`}>{t.investment}</span>
      <span className="mt-1 block text-[24px] font-semibold tracking-[-0.02em] tabular-nums">{eur(cost)}</span>
      <span className="mt-1 block text-[12px] text-muted-foreground">
        {t.amortization} <strong className="text-foreground/80">{t.years(years)}</strong>
      </span>
    </div>
  );
}
