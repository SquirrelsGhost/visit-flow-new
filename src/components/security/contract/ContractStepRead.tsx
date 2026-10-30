import { AlertTriangle, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { GLASS_LABEL } from "@/components/glass/glassStyles";
import { cn } from "@/lib/cn";
import { contractWizardTexts } from "@/texts/contractWizardTexts";
import { securityGateTexts } from "@/texts/securityGateTexts";
import { POLICY_PREAMBLE, POLICY_SECTIONS } from "@/texts/securityPolicyTexts";
import ContractSection from "./ContractSection";

interface ContractStepReadProps {
  isLeader: boolean;
}

const NOTE = "flex items-start gap-3 rounded-[22px] p-4 text-[13px] leading-relaxed ring-1 ring-inset";

/** Schritt 1: Präambel, Hinweis für Führungskräfte und alle Paragrafen als aufklappbare Liste (Inhalt unverändert). */
export default function ContractStepRead({ isLeader }: ContractStepReadProps) {
  const [openIds, setOpenIds] = useState<ReadonlySet<string>>(() => new Set([POLICY_SECTIONS[0]?.id ?? ""]));
  const allOpen = openIds.size === POLICY_SECTIONS.length;

  const toggle = (id: string) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="space-y-5">
      <div className={cn(NOTE, "bg-emerald-500/[0.07] text-foreground/85 ring-emerald-500/30")}>
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
        <p>{POLICY_PREAMBLE}</p>
      </div>
      {isLeader && (
        <div className={cn(NOTE, "bg-amber-500/[0.08] ring-amber-500/35")}>
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="font-semibold text-amber-800 dark:text-amber-300">{securityGateTexts.gateLeaderWarningTitle}</p>
            <p className="mt-1 text-foreground/80">{securityGateTexts.gateLeaderWarningBody}</p>
          </div>
        </div>
      )}
      <section>
        <div className="flex items-end justify-between gap-3">
          <h4 className={GLASS_LABEL}>{contractWizardTexts.sectionsTitle(POLICY_SECTIONS.length)}</h4>
          <button type="button" onClick={() => setOpenIds(allOpen ? new Set() : new Set(POLICY_SECTIONS.map((s) => s.id)))} className="no-touch-target-fix pb-2.5 pr-1 text-[12.5px] font-semibold text-red-600 hover:underline dark:text-red-400">
            {allOpen ? contractWizardTexts.collapseAll : contractWizardTexts.expandAll}
          </button>
        </div>
        <div className="glass-surface divide-y divide-[var(--glass-divider)] overflow-hidden rounded-[22px]">
          {POLICY_SECTIONS.map((section) => (
            <ContractSection key={section.id} section={section} open={openIds.has(section.id)} onToggle={() => toggle(section.id)} />
          ))}
        </div>
        <p className="px-1 pt-2.5 text-[12px] text-[var(--glass-label)]">{contractWizardTexts.version}</p>
      </section>
    </div>
  );
}
