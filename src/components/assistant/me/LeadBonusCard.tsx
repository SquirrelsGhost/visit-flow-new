import { Trophy, Zap } from "lucide-react";
import { LEAD_BONUS_EURO, LEAD_BONUS_TARGET, leadBonus } from "../../../lib/assistant/leadBonus";
import type { MeMetrics } from "../../../lib/assistant/meTypes";
import { cn } from "../../../lib/cn";
import { meTexts as t } from "../../../texts/assistantTexts";
import AnimatedNumber from "./AnimatedNumber";
import MeCard from "./MeCard";
import ProgressBar from "./ProgressBar";

/** Lead-Bonus der Sparte Lead (Solar), wie in v1: Balken bis 100 Netto-Leads im Monat. */
export interface LeadBonusCardProps { m: MeMetrics }

export default function LeadBonusCard({ m }: LeadBonusCardProps) {
  const b = leadBonus(m.monthlyLeads);
  const action = (
    <span className="text-right">
      <span className="block text-lg leading-none font-black whitespace-nowrap text-emerald-600 tabular-nums dark:text-emerald-400">
        <AnimatedNumber value={m.monthlyLeads} /> / {LEAD_BONUS_TARGET}
      </span>
      <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">{t.leadNettos}</span>
    </span>
  );

  return (
    <MeCard
      icon={Trophy}
      iconTone="bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md"
      title={t.leadBonusTitle}
      sub={t.leadBonusGoal(LEAD_BONUS_TARGET)}
      action={action}
      divided
    >
      <div className="space-y-4 p-4">
        <div className="space-y-1">
          <ProgressBar value={b.progress} track="h-2.5 bg-slate-100 dark:bg-slate-800" fill="from-emerald-500 to-teal-500" label={t.leadBonusTitle} />
          <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>0%</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{Math.round(b.progress)}%</span>
            <span>100%</span>
          </div>
        </div>
        <p
          className={cn(
            "flex items-center gap-2 rounded-xl border p-3 text-xs font-semibold",
            b.reached
              ? "border-emerald-200/60 bg-emerald-50/60 text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-950/20 dark:text-emerald-400"
              : "border-amber-200/60 bg-amber-50/60 text-amber-700 dark:border-amber-800/40 dark:bg-amber-950/20 dark:text-amber-400",
          )}
        >
          <Zap className="h-4 w-4 shrink-0" />
          {b.reached ? t.leadBonusReached(LEAD_BONUS_EURO) : t.leadBonusOpen(b.remaining, LEAD_BONUS_EURO)}
        </p>
      </div>
    </MeCard>
  );
}
