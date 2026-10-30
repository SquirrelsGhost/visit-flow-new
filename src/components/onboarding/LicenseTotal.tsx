import { formatEuro, LICENSE_PRICE, monthlyTotal } from "../../lib/onboarding/licenses";
import { onboardingTexts as T } from "../../texts/onboardingTexts";
import AnimatedPrice from "./AnimatedPrice";

interface LicenseTotalProps {
  licenses: number;
}

/** Summe der Lizenzen: Anzahl × Einzelpreis und der Monatsbetrag, der weich mitläuft. */
export default function LicenseTotal({ licenses }: LicenseTotalProps) {
  return (
    <div className="glass-surface flex flex-wrap items-center justify-between gap-3 rounded-[18px] p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="min-w-0">
        <div className="text-xs font-extrabold tabular-nums text-foreground">{T.totalLabel(licenses, formatEuro(LICENSE_PRICE))}</div>
        <p className="mt-0.5 text-[11px] text-muted-foreground">{T.totalIncludes}</p>
      </div>
      <div className="text-right">
        <span className="text-xl font-extrabold tracking-tight text-foreground" data-testid="license-total">
          <AnimatedPrice value={monthlyTotal(licenses)} />
        </span>
        <span className="block text-[10px] text-muted-foreground">{T.perMonth}</span>
      </div>
    </div>
  );
}
