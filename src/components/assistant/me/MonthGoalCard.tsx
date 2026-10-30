import { Target } from "lucide-react";
import { useStoredFlag } from "../../../hooks/useStoredFlag";
import { planMonthGoal } from "../../../lib/assistant/monthGoal";
import type { MeMetrics, MonthGoal } from "../../../lib/assistant/meTypes";
import { HIDE_AMOUNTS_KEY, hiddenAmount, PACE_TEXT } from "../../../lib/assistant/meStyles";
import { cn } from "../../../lib/cn";
import { meTexts as t } from "../../../texts/assistantTexts";
import AnimatedNumber from "./AnimatedNumber";
import MeCard from "./MeCard";
import MonthGoalStats from "./MonthGoalStats";
import ProgressBar from "./ProgressBar";

/** Monatsziel aus dem Provisionsrechner: Stand, Tempo und was pro Tag noch nötig ist (v1 DashboardTab). */
export interface MonthGoalCardProps { m: MeMetrics; goal: MonthGoal }

export default function MonthGoalCard({ m, goal }: MonthGoalCardProps) {
  const [hidden] = useStoredFlag(HIDE_AMOUNTS_KEY);
  const plan = planMonthGoal(goal, m.monthRevenue, m.conversion, new Date());
  const paceText = t.pace[plan.pace.kind](Math.round(plan.remaining), plan.remainingWorkDays, Math.round(plan.dailyNeeded));
  const blurPace = plan.pace.kind === "behind" || plan.pace.kind === "push";

  return (
    <MeCard
      icon={Target}
      iconTone="bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
      title={t.monthGoal}
      sub={t.monthGoalSub}
      className="relative"
      action={
        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
          {t.daysLeft(plan.remainingWorkDays)}
        </span>
      }
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 opacity-[0.04]" />
      <div className="relative space-y-4 px-4 pb-4">
        <div className={cn("text-center text-3xl font-black text-amber-600 tabular-nums transition-[filter] duration-300 dark:text-amber-400", hiddenAmount(hidden))}>
          <AnimatedNumber value={Math.round(m.monthRevenue)} />€{" "}
          <span className="text-lg font-semibold text-slate-400">/ {Math.round(goal.targetTotal).toLocaleString("de-DE")}€</span>
        </div>
        <div className="space-y-1">
          <ProgressBar value={plan.progress} track="h-3 bg-amber-200/40 dark:bg-amber-900/30" fill="from-amber-400 to-orange-500" label={t.monthGoal} />
          <div className="flex justify-between text-xs">
            <span className={cn("font-bold", PACE_TEXT[plan.pace.tone])}>{plan.progress.toFixed(0)}%</span>
            <span className={cn("text-slate-500 transition-[filter] duration-300 dark:text-slate-400", plan.remaining > 0 && hiddenAmount(hidden))}>
              {plan.remaining > 0 ? t.stillOpen(Math.round(plan.remaining)) : t.reached}
            </span>
          </div>
        </div>
        <MonthGoalStats goal={goal} plan={plan} conversion={m.conversion} hidden={hidden} />
        <div
          className={cn(
            "rounded-xl bg-slate-50 px-3 py-2.5 text-center text-[13px] font-semibold transition-[filter] duration-300 dark:bg-slate-800/50",
            PACE_TEXT[plan.pace.tone],
            blurPace && hiddenAmount(hidden),
          )}
        >
          {paceText}
        </div>
      </div>
    </MeCard>
  );
}
