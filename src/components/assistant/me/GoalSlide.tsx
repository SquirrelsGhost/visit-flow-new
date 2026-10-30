import { GOAL_ICONS, GOAL_TONES } from "../../../lib/assistant/meStyles";
import type { GoalView } from "../../../lib/assistant/meTypes";
import { cn } from "../../../lib/cn";
import { meTexts as t } from "../../../texts/assistantTexts";
import AnimatedNumber from "./AnimatedNumber";
import ProgressBar from "./ProgressBar";

/** Eine Ansicht im Ziel-Stapel: Besuche oder eine Produktkategorie, mit Stand, Ziel und Balken. */
export interface GoalSlideProps { view: GoalView }

export default function GoalSlide({ view }: GoalSlideProps) {
  const tone = GOAL_TONES[view.tone];
  const pct = view.target > 0 ? Math.min(100, (view.current / view.target) * 100) : 0;
  const left = Math.max(0, view.target - view.current);
  return (
    <div className="space-y-3 p-4 text-center select-none">
      <div className="flex items-center justify-center gap-2">
        <span className={cn("rounded-lg bg-gradient-to-br p-1.5 text-white shadow-md", tone.gradient)}>
          <GoalIcon category={view.category} />
        </span>
        <span className="text-sm font-bold text-slate-900 dark:text-white">{view.label}</span>
      </div>
      <div className="space-y-1">
        <div className="flex items-baseline justify-center gap-1.5 tabular-nums">
          <AnimatedNumber value={view.current} className={cn("text-4xl font-bold", tone.strong)} />
          <span className="text-lg text-slate-400 dark:text-slate-500">/</span>
          <span className={cn("text-2xl font-semibold", tone.soft)}>{view.target}</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400">{view.category ?? t.visits}</p>
      </div>
      <div className="space-y-1.5">
        <ProgressBar value={pct} track={tone.track} fill={tone.gradient} label={view.category ?? t.visits} />
        <div className="flex items-center justify-between text-xs">
          <span className={cn("font-bold", tone.strong)}>{Math.round(pct)}%</span>
          {left === 0 ? (
            <span className="font-semibold text-green-600 dark:text-green-400">✅</span>
          ) : (
            <span className="text-slate-600 dark:text-slate-400">
              {t.stillN} {left}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function GoalIcon({ category }: { category: string | undefined }) {
  const Icon = GOAL_ICONS[category ?? "visits"] ?? GOAL_ICONS.other!;
  return <Icon className="h-4 w-4" />;
}
