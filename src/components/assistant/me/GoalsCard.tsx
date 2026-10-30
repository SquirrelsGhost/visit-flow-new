import { Target } from "lucide-react";
import { useDeck } from "../../../hooks/useDeck";
import { dailyViews, weeklyViews } from "../../../lib/assistant/goalViews";
import type { MeMetrics } from "../../../lib/assistant/meTypes";
import { meTexts as t } from "../../../texts/assistantTexts";
import GoalSlide from "./GoalSlide";
import MeCard from "./MeCard";
import SwipeDeck from "./SwipeDeck";

/** Tages- und Wochenziele nebeneinander; beide Stapel wischen gemeinsam durch die Kategorien wie in v1. */
export interface GoalsCardProps { m: MeMetrics }

export default function GoalsCard({ m }: GoalsCardProps) {
  const daily = dailyViews(m, t.today);
  const weekly = weeklyViews(m, t.week);
  const deck = useDeck(Math.min(daily.length, weekly.length));
  const columns = [daily, weekly];

  return (
    <MeCard
      icon={Target}
      iconTone="bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400"
      title={t.goalsTitle}
      sub={daily.length > 1 ? t.goalsSub : undefined}
      divided
    >
      <div className="grid grid-cols-2 divide-x divide-slate-200 dark:divide-slate-700">
        {columns.map((views, col) => (
          <SwipeDeck key={col} count={views.length} index={deck.index} dir={deck.dir} onStep={deck.step}>
            {(i) => <GoalSlide view={views[i] ?? views[0]!} />}
          </SwipeDeck>
        ))}
      </div>
    </MeCard>
  );
}
