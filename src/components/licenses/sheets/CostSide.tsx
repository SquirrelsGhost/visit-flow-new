import { cn } from "../../../lib/cn";
import { monthlyCost } from "../../../lib/licenses/licenseLogic";
import { eur } from "../../../lib/tariff/eur";
import { licenseTexts } from "../../../texts/licenseTexts";

interface CostSideProps {
  label: string;
  count: number;
  /** Neuer Stand: rot hinterlegt, sobald er sich vom bisherigen unterscheidet. */
  strong?: boolean;
}

/** Eine Seite des Kostenvergleichs: Beschriftung, Monatsbetrag, Anzahl. */
export default function CostSide({ label, count, strong = false }: CostSideProps) {
  return (
    <div className={cn("flex-1 rounded-2xl px-3.5 py-3", strong ? "bg-red-500/10" : "bg-slate-900/[0.04] dark:bg-white/[0.05]")}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--glass-label)]">{label}</p>
      <p className={cn("mt-1 text-[18px] font-semibold tabular-nums", strong ? "text-red-600 dark:text-red-300" : "text-foreground")}>{eur(monthlyCost(count))}</p>
      <p className="text-[12px] text-muted-foreground">
        {count} {licenseTexts.sheets.count.unit}
      </p>
    </div>
  );
}
