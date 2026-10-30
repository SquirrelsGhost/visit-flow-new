import { BookOpen, Check, CreditCard, IdCard, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import type { IdentDocType } from "@/lib/security/securityContractStore";
import { identWizardTexts } from "@/texts/identWizardTexts";
import { securityGateTexts } from "@/texts/securityGateTexts";

interface IdentDocTypePickerProps {
  value: IdentDocType;
  onChange: (value: IdentDocType) => void;
}

const OPTIONS: readonly { value: IdentDocType; label: string; icon: LucideIcon }[] = [
  { value: "personalausweis", label: securityGateTexts.identDocTypeIdCard, icon: IdCard },
  { value: "reisepass", label: securityGateTexts.identDocTypePassport, icon: BookOpen },
  { value: "aufenthaltstitel", label: securityGateTexts.identDocTypeResidence, icon: CreditCard },
];

const OPTION =
  "relative flex items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition-[border-color,background-color,box-shadow,transform] duration-300 active:scale-[0.98] focus:outline-none focus-visible:ring-4 focus-visible:ring-red-500/15 motion-reduce:transition-none sm:flex-col sm:items-start sm:gap-2.5 sm:py-3.5";
const OPTION_ON = "border-red-400/60 bg-red-500/[0.06] shadow-[0_10px_24px_-14px_rgba(220,38,38,0.6)] dark:bg-red-500/[0.09]";
const OPTION_OFF = "border-[var(--glass-divider)] bg-white/60 hover:bg-white dark:bg-white/[0.04] dark:hover:bg-white/[0.07]";

/** Ausweisart als drei Karten statt Auswahlliste: auf dem Handy untereinander, ab sm nebeneinander. */
export default function IdentDocTypePicker({ value, onChange }: IdentDocTypePickerProps) {
  return (
    <div role="radiogroup" aria-label={identWizardTexts.docTypeLegend}>
      <p className="pb-1.5 pl-1 text-[13px] font-medium text-foreground/85">{identWizardTexts.docTypeLegend}</p>
      <div className="grid gap-2 sm:grid-cols-3">
        {OPTIONS.map(({ value: option, label, icon: Icon }) => {
          const active = option === value;
          return (
            <button key={option} type="button" role="radio" aria-checked={active} onClick={() => onChange(option)} className={cn(OPTION, active ? OPTION_ON : OPTION_OFF)}>
              <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors duration-300", active ? "bg-gradient-to-b from-red-500 to-red-600 text-white" : "bg-[var(--glass-track)] text-slate-500 dark:text-white/50")}>
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <span className="min-w-0 flex-1 text-[13px] font-semibold leading-snug text-foreground sm:pr-5">{label}</span>
              <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-[background-color,box-shadow] duration-300 sm:absolute sm:right-3 sm:top-3", active ? "bg-red-500 text-white" : "ring-1 ring-inset ring-slate-300 dark:ring-white/20")}>
                {active && <Check className="h-3 w-3" strokeWidth={3} />}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
