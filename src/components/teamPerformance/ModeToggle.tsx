import { motion } from "motion/react";
import { cn } from "../../lib/cn";
import { SNAPPY_SPRING } from "../../lib/motion/presets";
import type { ChartMode } from "../../lib/team/teamPerformance";
import { teamPerformanceTexts as texts } from "../../texts/teamPerformanceTexts";

interface ModeToggleProps {
  mode: ChartMode;
  onChange: (mode: ChartMode) => void;
}

const MODES: readonly ChartMode[] = ["daily", "trend"];

/** Kleiner Umschalter Täglich / 7-Tage-Trend; die helle Fläche gleitet zur Wahl. */
export default function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div role="radiogroup" aria-label={texts.modeLabel} className="flex shrink-0 rounded-full bg-[var(--glass-track)] p-0.5">
      {MODES.map((m) => (
        <button
          key={m}
          type="button"
          role="radio"
          aria-checked={mode === m}
          onClick={() => onChange(m)}
          className={cn("relative rounded-full px-2.5 py-1 text-[11.5px] font-semibold transition-colors", mode === m ? "text-foreground" : "text-muted-foreground")}
        >
          {mode === m && <motion.span layoutId="perf-mode" transition={SNAPPY_SPRING} className="absolute inset-0 rounded-full bg-white shadow-sm dark:bg-white/15" />}
          <span className="relative">{m === "daily" ? texts.daily : texts.trend}</span>
        </button>
      ))}
    </div>
  );
}
