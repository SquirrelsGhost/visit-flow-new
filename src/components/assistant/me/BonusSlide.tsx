import { Award, ShieldCheck, Smartphone, TrendingUp, Tv, Wifi, type LucideIcon } from "lucide-react";
import { bonusProgress } from "../../../lib/assistant/bonusTiers";
import type { BonusCategory, BonusIcon, BonusTier } from "../../../lib/assistant/meTypes";
import { cn } from "../../../lib/cn";
import { meTexts as t } from "../../../texts/assistantTexts";
import AnimatedNumber from "./AnimatedNumber";
import ProgressBar from "./ProgressBar";

const ICONS: Record<BonusIcon, LucideIcon> = {
  wifi: Wifi,
  "wifi-tv": Wifi,
  smartphone: Smartphone,
  tv: Tv,
  "trending-up": TrendingUp,
  award: Award,
  "shield-check": ShieldCheck,
};

const euro = (n: number) => n.toLocaleString("de-DE");
const tierAmount = (tier: BonusTier) => (tier.perProduct ? `${tier.bonusAmount}${t.perProduct}` : `${euro(tier.bonusAmount)}€`);

/** Eine Bonuskategorie: erreichte Staffel, Stand zur nächsten Staffel und aktueller Bonus (v1 SwipeableBonusCard). */
export interface BonusSlideProps { category: BonusCategory; count: number }

export default function BonusSlide({ category, count }: BonusSlideProps) {
  const Icon = ICONS[category.icon];
  const p = bonusProgress(category, count);
  const next = category.tiers.find((tier) => tier.target === p.nextTarget);
  return (
    <div className="space-y-3 p-4 text-center select-none">
      <div className="flex items-center justify-center gap-2">
        <span className={cn("rounded-lg bg-gradient-to-br p-1.5 text-white shadow-md", category.gradient)}>
          <Icon className="h-4 w-4" />
        </span>
        <span className="text-sm font-bold text-slate-900 dark:text-white">{category.name}</span>
      </div>
      <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
        {p.reached && <span className="text-green-600 dark:text-green-400">{t.tierReached(p.reached.stufe, tierAmount(p.reached))}</span>}
        {p.reached && next && " · "}
        {next && t.tierNext(next.stufe, tierAmount(next))}
      </div>
      <div className="space-y-1">
        <div className="flex items-baseline justify-center gap-1.5 tabular-nums">
          <AnimatedNumber value={count} className="text-4xl font-bold text-amber-600 dark:text-amber-400" />
          <span className="text-lg text-slate-400 dark:text-slate-500">/</span>
          <span className="text-2xl font-semibold text-amber-500 dark:text-amber-400">{p.nextTarget ?? p.reached?.target ?? 0}</span>
        </div>
        <p className={cn("text-sm font-bold", p.amount > 0 ? "text-green-700 dark:text-green-300" : "text-slate-500 dark:text-slate-400")}>
          {t.currentBonus(euro(p.amount))}
        </p>
      </div>
      <div className="space-y-1.5">
        <ProgressBar value={p.progress} track="bg-amber-200 dark:bg-amber-900/40" fill="from-amber-400 to-amber-600" label={category.name} />
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-amber-600 dark:text-amber-400">{Math.round(p.progress)}%</span>
          {p.nextTarget === null ? (
            <span className="font-semibold text-green-600 dark:text-green-400">{t.maxReached}</span>
          ) : (
            <span className="text-slate-600 dark:text-slate-400">
              {t.stillN} {p.remaining}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
