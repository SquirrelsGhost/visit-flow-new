import { Check, Scale } from "lucide-react";
import { cn } from "@/lib/cn";
import { identWizardTexts } from "@/texts/identWizardTexts";
import { securityGateTexts } from "@/texts/securityGateTexts";

interface IdentLiabilityConsentProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/** Bürgschaft nach § 278 BGB samt DSGVO-Einwilligung als große, gut lesbare Bestätigungskarte. */
export default function IdentLiabilityConsent({ checked, onChange }: IdentLiabilityConsentProps) {
  return (
    <label className={cn("group flex cursor-pointer items-start gap-3.5 rounded-[22px] p-4 ring-1 ring-inset transition-[background-color,box-shadow] duration-300", checked ? "bg-emerald-500/[0.07] ring-emerald-500/45" : "bg-amber-500/[0.07] ring-amber-500/35 hover:bg-amber-500/[0.1]")}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span aria-hidden className={cn("mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition-[background-color,box-shadow,transform] duration-300 peer-focus-visible:ring-4 peer-focus-visible:ring-red-500/20 group-active:scale-90", checked ? "bg-emerald-500 text-white shadow-[0_6px_16px_-6px_rgba(16,185,129,0.8)]" : "bg-white ring-[1.5px] ring-inset ring-amber-500/50 dark:bg-white/5")}>
        {checked && <Check className="h-4 w-4" strokeWidth={3} />}
      </span>
      <span className="min-w-0">
        <span className={cn("flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.12em]", checked ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-300")}>
          <Scale className="h-3.5 w-3.5" /> § 278 BGB · DSGVO
        </span>
        <span className="mt-1.5 block text-[13px] leading-relaxed text-foreground/90">
          {securityGateTexts.identLiabilityCheck}
          {identWizardTexts.liabilityConsentSuffix}
        </span>
      </span>
    </label>
  );
}
