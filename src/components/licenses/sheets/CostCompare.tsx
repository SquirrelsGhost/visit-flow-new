import { ArrowRight } from "lucide-react";
import { cn } from "../../../lib/cn";
import { monthlyCost } from "../../../lib/licenses/licenseLogic";
import CostSide from "./CostSide";
import { eur } from "../../../lib/tariff/eur";
import { licenseTexts } from "../../../texts/licenseTexts";

interface CostCompareProps {
  from: number;
  to: number;
}

const texts = licenseTexts.sheets.count;

/** Bisheriger und neuer Monatsbetrag nebeneinander, darunter die Differenz (v1 Bestätigungsdialog). */
export default function CostCompare({ from, to }: CostCompareProps) {
  const diff = monthlyCost(to) - monthlyCost(from);
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <CostSide label={texts.now} count={from} />
        <ArrowRight aria-hidden className="h-4 w-4 shrink-0 text-slate-400" />
        <CostSide label={texts.next} count={to} strong={to !== from} />
      </div>
      <p className="flex justify-between px-1 text-[13px] text-muted-foreground">
        <span>{texts.diff}</span>
        <span className={cn("font-semibold tabular-nums", diff > 0 ? "text-foreground" : diff < 0 ? "text-emerald-600 dark:text-emerald-400" : "")}>
          {diff > 0 ? "+" : diff < 0 ? "−" : "±"}
          {eur(Math.abs(diff))}
        </span>
      </p>
    </div>
  );
}
