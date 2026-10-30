import type { GoalProgress } from "../../../lib/overview/contestTypes";
import { categoryLabel } from "../../../lib/overview/productGroups";
import { fill } from "../../../texts/profileTexts";
import { overviewTexts } from "../../../texts/overviewTexts";
import GlassProgress from "../../glass/GlassProgress";

interface GoalBarProps {
  goal: GoalProgress;
}

const texts = overviewTexts.contest;

/** Ein Ziel einer Person: Kategorie, heutiges Plus, Stand gegen Ziel und Balken (grün, sobald geschafft). */
export default function GoalBar({ goal }: GoalBarProps) {
  const done = goal.current >= goal.target;
  const label = categoryLabel(goal.category);
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 text-[12px]">
        <span className="font-medium text-muted-foreground">
          {done && <span className="mr-1 text-emerald-500">✓</span>}
          {label}
        </span>
        <span className="flex items-baseline gap-2 tabular-nums">
          {goal.today > 0 && <span className="font-semibold text-emerald-600 dark:text-emerald-400">{fill(texts.todayPlus, { count: goal.today })}</span>}
          <span className="font-semibold text-foreground">
            {goal.current}/{goal.target}
          </span>
        </span>
      </div>
      <GlassProgress share={goal.target > 0 ? goal.current / goal.target : 0} label={label} tone={done ? "green" : "orange"} now={goal.current} max={goal.target} className="mt-1.5" />
    </div>
  );
}
