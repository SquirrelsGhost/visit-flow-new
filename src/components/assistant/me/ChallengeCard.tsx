import { CheckCircle, Clock, Trophy, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useCountdown } from "../../../hooks/useCountdown";
import { CHALLENGE_EMOJI, DIFFICULTY_FILL } from "../../../lib/assistant/meStyles";
import type { Challenge } from "../../../lib/assistant/meTypes";
import { cn } from "../../../lib/cn";
import { riseIn } from "../../../lib/motion/presets";
import { meTexts as t } from "../../../texts/assistantTexts";
import ProgressBar from "./ProgressBar";

/** Eine Challenge mit Restzeit, Fortschritt und XP (v1 DailyChallengeCard), ohne Dauer-Pulsieren. */
export interface ChallengeCardProps { c: Challenge }

export default function ChallengeCard({ c }: ChallengeCardProps) {
  const { label, urgent } = useCountdown(c.endsAt);
  const pct = c.target > 0 ? Math.min(100, (c.current / c.target) * 100) : 0;
  const near = !c.completed && pct >= 80;
  const bonusOpen = !c.completed && pct < 50 && c.bonusXp;

  return (
    <motion.article
      variants={riseIn}
      className={cn(
        "relative overflow-hidden rounded-2xl border p-4 transition-shadow duration-300",
        c.completed && "border-green-500/70 bg-gradient-to-br from-green-500/10 to-emerald-500/5 shadow-lg shadow-green-500/10",
        near && "border-orange-400/80 bg-gradient-to-br from-orange-500/10 to-yellow-500/5 shadow-lg shadow-orange-500/10",
        !c.completed && !near && "border-[var(--glass-divider)] bg-card hover:shadow-md",
      )}
    >
      {(c.completed || c.bonusEarned) && (
        <span
          className={cn(
            "absolute top-2 right-2 flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold text-white",
            c.bonusEarned ? "bg-gradient-to-r from-yellow-500 to-orange-500" : "bg-green-500",
          )}
        >
          {c.bonusEarned ? <Zap className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
          {c.bonusEarned ? t.bonusBadge : t.done}
        </span>
      )}
      <div className="mb-3 pr-16">
        <h4 className="flex items-center gap-2 text-base font-bold text-foreground">
          <span className="text-xl" aria-hidden>
            {CHALLENGE_EMOJI[c.category]}
          </span>
          {c.name}
        </h4>
        <p className="mt-0.5 text-sm text-muted-foreground">{c.description}</p>
      </div>
      <div className="mb-3 space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t.progress(c.current, c.target)}</span>
          <span className={cn("font-bold", c.completed ? "text-green-500" : near ? "text-orange-500" : "text-foreground")}>{Math.round(pct)}%</span>
        </div>
        <ProgressBar value={pct} track="h-2.5 bg-slate-200 dark:bg-slate-700" fill={DIFFICULTY_FILL[c.difficulty]} label={c.name} />
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className={cn("flex items-center gap-1 font-medium", urgent ? "text-red-500" : "text-muted-foreground")}>
          <Clock className="h-4 w-4" />
          {label ?? t.expired}
        </span>
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-bold text-yellow-600 dark:text-yellow-400">
            <Trophy className="h-4 w-4 text-yellow-500" />
            {c.xp} XP
          </span>
          {bonusOpen && (
            <span className="flex items-center gap-1 text-xs font-bold text-orange-500">
              <Zap className="h-4 w-4" />+{c.bonusXp}
            </span>
          )}
        </span>
      </div>
      {near && (
        <p className="mt-3 rounded-lg border border-orange-400/70 bg-gradient-to-r from-orange-500/15 to-yellow-500/15 p-2 text-center text-xs font-semibold text-orange-700 dark:text-orange-300">
          {t.almost(c.target - c.current)}
        </p>
      )}
      {c.completed && (
        <p className="mt-3 flex items-center justify-center gap-1 rounded-lg border border-green-500/70 bg-gradient-to-r from-green-500/15 to-emerald-500/15 p-2 text-center text-xs font-semibold text-green-700 dark:text-green-300">
          <CheckCircle className="h-4 w-4" />
          {t.challengeDone}
          {c.bonusEarned && t.bonusEarned}
        </p>
      )}
    </motion.article>
  );
}
