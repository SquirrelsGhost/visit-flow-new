import { CheckCircle2, Mail } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../../lib/cn";
import { SOFT_SPRING } from "../../lib/motion/presets";
import { onboardingTexts as T } from "../../texts/onboardingTexts";
import { FIELD } from "./onboardingClasses";

interface LicenseRowProps {
  index: number;
  value: string;
  onChange: (value: string) => void;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Ein Lizenz-Platz: Nummer und die Adresse des Beraters, der ihn bekommt. */
export default function LicenseRow({ index, value, onChange }: LicenseRowProps) {
  const valid = EMAIL.test(value.trim());
  const id = `license-${index}`;
  return (
    <motion.li
      layout="position"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={SOFT_SPRING}
      className="overflow-hidden"
    >
      <div className="flex items-center gap-2 py-1">
        <label
          htmlFor={id}
          className={cn(
            "w-[4.75rem] shrink-0 rounded-lg px-2 py-1 text-center text-[11px] font-bold tabular-nums transition-colors duration-300",
            valid ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-slate-100 text-muted-foreground dark:bg-white/[0.05]",
          )}
        >
          {T.slotLabel(index)}
        </label>
        <div className="group relative flex-1">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors duration-300 group-focus-within:text-red-500" strokeWidth={1.75} />
          <input
            id={id}
            type="email"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={T.slotPlaceholder}
            autoComplete="off"
            className={cn(FIELD, "h-10 pl-9 pr-9 text-base sm:text-sm")}
          />
          {valid && <CheckCircle2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500" strokeWidth={2} />}
        </div>
      </div>
    </motion.li>
  );
}
