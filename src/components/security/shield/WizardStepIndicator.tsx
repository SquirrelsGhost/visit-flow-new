import { Check, Save } from "lucide-react";

interface WizardStepIndicatorProps {
  steps: readonly string[];
  currentStep: number;
  onSelectStep?: (step: number) => void;
}

export default function WizardStepIndicator({
  steps,
  currentStep,
  onSelectStep,
}: WizardStepIndicatorProps) {
  return (
    <div className="border-b border-slate-800/90 bg-slate-950/70 px-5 py-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {steps.map((label, idx) => {
            const num = idx + 1;
            const done = num < currentStep;
            const active = num === currentStep;
            return (
              <button
                key={label}
                type="button"
                disabled={num > currentStep}
                onClick={() => num < currentStep && onSelectStep?.(num)}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition ${
                  active
                    ? "border-emerald-500/60 bg-emerald-500/20 text-emerald-200"
                    : done
                      ? "border-emerald-500/30 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-950/50"
                      : "cursor-not-allowed border-slate-800 bg-slate-900/50 text-slate-500"
                }`}
              >
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-950/70 text-[10px]">
                  {done ? <Check className="h-3 w-3 text-emerald-400" /> : num}
                </span>
                <span>{label}</span>
              </button>
            );
          })}
        </div>
        <span className="hidden items-center gap-1 text-[10px] text-slate-400 sm:inline-flex" title="Fortschritt wird automatisch in der Sitzung zwischengespeichert">
          <Save className="h-3 w-3 text-emerald-400" />
          Automatisch gespeichert
        </span>
      </div>
    </div>
  );
}
