import type { MonthGoalPlan } from "../../../lib/assistant/monthGoal";
import type { MeMetrics, MonthGoal } from "../../../lib/assistant/meTypes";
import { hiddenAmount, PRODUCT_DOTS } from "../../../lib/assistant/meStyles";
import { cn } from "../../../lib/cn";
import { meTexts as t } from "../../../texts/assistantTexts";

interface MonthGoalStatsProps {
  goal: MonthGoal;
  plan: MonthGoalPlan;
  conversion: MeMetrics["conversion"];
  hidden: boolean;
}

const BOX = "rounded-xl bg-slate-50 p-2 text-center dark:bg-slate-800/50";

/** Was es pro Tag noch braucht (Euro, Abschlüsse, Türen) und welche Produkte das Ziel ausmachen. */
export default function MonthGoalStats({ goal, plan, conversion, hidden }: MonthGoalStatsProps) {
  const rate = conversion.isPersonalized ? Math.round(conversion.rate * 100) : null;
  return (
    <>
      {plan.remaining > 0 && (
        <div className="grid grid-cols-3 gap-2">
          <div className={BOX}>
            <div className={cn("text-lg font-bold text-slate-900 tabular-nums transition-[filter] duration-300 dark:text-white", hiddenAmount(hidden))}>
              {Math.round(plan.dailyNeeded)}€
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">{t.perDay}</div>
          </div>
          <div className={BOX}>
            <div className="text-lg font-bold text-slate-900 tabular-nums dark:text-white">{Math.ceil(plan.dailySalesNeeded)}</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">{t.salesPerDay}</div>
          </div>
          <div className={BOX}>
            <div className="text-lg font-bold text-slate-900 tabular-nums dark:text-white">~{Math.min(plan.doorsPerDay, 99)}</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">{t.doorsPerDay(rate)}</div>
          </div>
        </div>
      )}
      {goal.products.length > 0 && (
        <div className="space-y-2">
          <div className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">{t.productsForGoal}</div>
          <ul className="space-y-1.5">
            {goal.products.map((p) => (
              <li key={`${p.category}-${p.name}`} className="flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-1.5 dark:bg-slate-800/50">
                <span className="flex items-center gap-2">
                  <span className={cn("h-2 w-2 rounded-full", PRODUCT_DOTS[p.category] ?? "bg-gray-400")} />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{p.name}</span>
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">{p.quantity}x</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
