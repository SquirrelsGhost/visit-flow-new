import { Check, ChevronDown, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { cn } from "../../lib/cn";
import { SOFT_SPRING } from "../../lib/motion/presets";
import { REQUIREMENT_LABELS, STRENGTH_LABELS, type PasswordCheck, type PasswordRequirements } from "../../lib/register/passwordStrength";

interface PasswordStrengthMeterProps {
  check: PasswordCheck;
}

const BAR: Record<PasswordCheck["strength"], string> = {
  weak: "bg-red-500",
  fair: "bg-orange-500",
  good: "bg-yellow-500",
  strong: "bg-green-500",
  excellent: "bg-emerald-500",
};

const TEXT: Record<PasswordCheck["strength"], string> = {
  weak: "text-red-600 dark:text-red-500",
  fair: "text-orange-600 dark:text-orange-500",
  good: "text-yellow-600 dark:text-yellow-500",
  strong: "text-green-600 dark:text-green-500",
  excellent: "text-emerald-600 dark:text-emerald-500",
};

const MAX_SCORE = 5;

/** Passwort-Stärke aus v1. Der Balken wächst weich, die Anforderungen klappen auf statt in einem Popover zu stehen. */
export default function PasswordStrengthMeter({ check }: PasswordStrengthMeterProps) {
  const [open, setOpen] = useState(false);
  const entries = Object.entries(check.requirements) as [keyof PasswordRequirements, boolean][];
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className="inline-flex items-center gap-1 text-sm font-medium text-foreground"
        >
          Passwort-Stärke
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-300", open && "rotate-180")} />
        </button>
        <span className={cn("text-sm font-semibold transition-colors duration-300", TEXT[check.strength])}>{STRENGTH_LABELS[check.strength]}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/70 dark:bg-white/10">
        <motion.div
          className={cn("h-full rounded-full transition-colors duration-300", BAR[check.strength])}
          initial={false}
          animate={{ width: `${Math.max(check.score, 0.4) * (100 / MAX_SCORE)}%` }}
          transition={SOFT_SPRING}
        />
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={SOFT_SPRING}
            className="grid grid-cols-1 gap-1.5 overflow-hidden pt-1 sm:grid-cols-2"
          >
            {entries.map(([key, met]) => (
              <li key={key} className="flex items-center gap-2 text-xs">
                <span className={cn("flex h-4 w-4 items-center justify-center rounded-full transition-colors duration-300", met ? "bg-green-500" : "bg-slate-200 dark:bg-white/10")}>
                  {met ? <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} /> : <X className="h-2.5 w-2.5 text-muted-foreground" />}
                </span>
                <span className={cn("transition-colors duration-300", met ? "text-green-600 dark:text-green-500" : "text-muted-foreground")}>{REQUIREMENT_LABELS[key]}</span>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
