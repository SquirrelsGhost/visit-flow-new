import { Minus, Plus } from "lucide-react";
import { cn } from "../../../lib/cn";

interface NumberStepperProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

const STEP =
  "flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-[background-color,color,transform] duration-200 hover:bg-red-500/10 hover:text-red-600 active:scale-90 disabled:opacity-30 disabled:hover:bg-transparent dark:text-white/60 dark:hover:text-red-300";

/** − Zahl + in einer Glaskapsel; die Zahl lässt sich auch direkt eintippen. */
export default function NumberStepper({ label, value, onChange, min = 0, max = 9999 }: NumberStepperProps) {
  const set = (next: number) => onChange(Math.max(min, Math.min(max, Number.isFinite(next) ? Math.round(next) : min)));
  return (
    <div className="flex shrink-0 items-center gap-0.5 rounded-full bg-[var(--glass-track)]/70 p-0.5 ring-1 ring-inset ring-[var(--glass-divider)]">
      <button type="button" aria-label={`${label} weniger`} disabled={value <= min} onClick={() => set(value - 1)} className={STEP}>
        <Minus className="h-3.5 w-3.5" />
      </button>
      <input
        aria-label={label}
        inputMode="numeric"
        value={value}
        onChange={(e) => set(Number(e.target.value.replace(/\D/g, "") || 0))}
        onFocus={(e) => e.target.select()}
        className={cn("h-8 w-11 bg-transparent text-center text-[15px] font-semibold tabular-nums text-foreground focus:outline-none", value === 0 && "text-slate-400 dark:text-white/35")}
      />
      <button type="button" aria-label={`${label} mehr`} disabled={value >= max} onClick={() => set(value + 1)} className={STEP}>
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
