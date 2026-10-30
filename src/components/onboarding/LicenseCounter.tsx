import { Minus, Plus, type LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { LICENSES } from "../../lib/onboarding/licenses";
import { onboardingTexts as T } from "../../texts/onboardingTexts";

interface LicenseCounterProps {
  value: number;
  onChange: (value: number) => void;
}

interface StepButtonProps {
  Icon: LucideIcon;
  label: string;
  disabled: boolean;
  onClick: () => void;
}

const ROUND =
  "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[var(--glass-divider)] bg-card text-foreground shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition-colors duration-300 hover:border-red-300 hover:text-red-600 disabled:pointer-events-none disabled:opacity-40 dark:hover:border-red-900 dark:hover:text-red-400 touch-manipulation";

function StepButton({ Icon, label, disabled, onClick }: StepButtonProps) {
  return (
    <motion.button type="button" aria-label={label} disabled={disabled} onClick={onClick} whileTap={{ scale: 0.9 }} className={ROUND}>
      <Icon className="h-5 w-5" strokeWidth={2} />
    </motion.button>
  );
}

/** Lizenzanzahl mit Minus/Plus und direkter Eingabe in der Mitte. */
export default function LicenseCounter({ value, onChange }: LicenseCounterProps) {
  // Beim Tippen darf das Feld kurz leer sein, gebucht wird erst eine gültige Zahl
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <div className="flex items-center gap-3">
      <StepButton Icon={Minus} label={T.fewer} disabled={value <= LICENSES.min} onClick={() => onChange(value - 1)} />
      <label className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/70 transition-[border-color,box-shadow] duration-300 focus-within:border-red-400 focus-within:ring-4 focus-within:ring-red-500/[0.08] dark:border-neutral-800 dark:bg-white/[0.03]">
        <span className="sr-only">{T.licenseCountLabel}</span>
        <input
          type="number"
          inputMode="numeric"
          min={LICENSES.min}
          max={LICENSES.max}
          value={draft ?? value}
          onChange={(event) => {
            setDraft(event.target.value);
            if (event.target.value !== "") onChange(Number(event.target.value));
          }}
          onFocus={(event) => event.target.select()}
          onBlur={() => setDraft(null)}
          className="w-16 bg-transparent text-right text-2xl font-extrabold tabular-nums tracking-tight text-foreground [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          data-testid="license-count"
        />
        <span className="text-sm font-semibold text-muted-foreground">{T.licenseUnit(value)}</span>
      </label>
      <StepButton Icon={Plus} label={T.more} disabled={value >= LICENSES.max} onClick={() => onChange(value + 1)} />
    </div>
  );
}
