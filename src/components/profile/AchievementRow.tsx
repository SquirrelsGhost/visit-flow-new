import { Lock, Trophy } from "lucide-react";
import { cn } from "../../lib/cn";
import type { Achievement } from "../../lib/profile/profileTypes";
import { TIER_BADGE } from "../../lib/profile/tierStyles";
import { fill, profileTexts } from "../../texts/profileTexts";
import GlassProgress from "../glass/GlassProgress";
import { ROW, ROW_SUBTITLE, ROW_TILE, ROW_TITLE } from "../settings/settingsStyles";

interface AchievementRowProps {
  achievement: Achievement;
}

const texts = profileTexts.achievements;

/** Ein Erfolg: Stufen-Plakette, Name, Fortschritt zur nächsten Stufe als feiner Balken. */
export default function AchievementRow({ achievement }: AchievementRowProps) {
  const { tier, current, target } = achievement;
  const share = target > 0 ? Math.min(1, current / target) : 0;
  const Icon = tier ? Trophy : Lock;
  return (
    <div className={ROW}>
      <span aria-hidden className={cn(ROW_TILE, tier ? TIER_BADGE[tier] : "bg-[var(--glass-track)] text-slate-500 dark:text-white/50")}>
        <Icon className="h-[17px] w-[17px]" strokeWidth={2.2} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2">
          <span className={cn(ROW_TITLE, "truncate")}>{achievement.name}</span>
          <span className="shrink-0 text-[12px] tabular-nums text-muted-foreground">{fill(texts.progress, { current: current.toLocaleString("de-DE"), target: target.toLocaleString("de-DE") })}</span>
        </span>
        <span className={cn(ROW_SUBTITLE, "truncate")}>
          {tier ? profileTexts.tiers[tier] : texts.locked} · {achievement.description}
        </span>
        <GlassProgress share={share} label={achievement.name} now={current} max={target} className="mt-2.5" />
      </span>
    </div>
  );
}
