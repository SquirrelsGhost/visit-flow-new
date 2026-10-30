import { motion } from "motion/react";
import { cn } from "../../lib/cn";
import { SNAPPY_SPRING } from "../../lib/motion/presets";
import { LICENSE_PRESETS } from "../../lib/onboarding/licenses";
import { CHIP } from "./onboardingClasses";

interface LicensePresetsProps {
  value: number;
  onChange: (value: number) => void;
}

/** Schnellwahl der Lizenzanzahl. Die rote Markierung gleitet zum gewählten Wert. */
export default function LicensePresets({ value, onChange }: LicensePresetsProps) {
  return (
    <div className="flex items-center gap-1 rounded-xl bg-white/70 p-0.5 ring-1 ring-inset ring-slate-200/80 dark:bg-white/[0.03] dark:ring-white/10">
      {LICENSE_PRESETS.map((preset) => {
        const active = value === preset;
        return (
          <button
            key={preset}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(preset)}
            className={cn(CHIP, active ? "text-white" : "text-muted-foreground hover:text-foreground")}
          >
            {active && (
              <motion.span
                layoutId="license-preset"
                transition={SNAPPY_SPRING}
                className="absolute inset-0 rounded-lg bg-gradient-to-b from-red-500 to-red-600 shadow-[0_4px_10px_-4px_rgba(220,38,38,0.6)]"
              />
            )}
            <span className="relative">{preset}</span>
          </button>
        );
      })}
    </div>
  );
}
