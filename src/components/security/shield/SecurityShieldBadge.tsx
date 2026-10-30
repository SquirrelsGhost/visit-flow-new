// Needs button click handler to open the security contract modal
"use client";

import { ShieldCheck } from "lucide-react";
import { openSecurityContractModal } from "@/lib/security/securityContractStore";
import { securityGateTexts } from "@/texts/securityGateTexts";

interface SecurityShieldBadgeProps {
  visible?: boolean;
}

const BADGE_CLASS =
  "fixed bottom-3 right-3 z-30 hidden items-center gap-1.5 rounded-full border border-emerald-500/25 bg-slate-950/80 px-2.5 py-1 text-[11px] font-medium text-emerald-300 shadow-lg backdrop-blur-md transition hover:border-emerald-400/50 hover:bg-slate-900 sm:inline-flex";

export default function SecurityShieldBadge({ visible = true }: SecurityShieldBadgeProps) {
  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={openSecurityContractModal}
      title={securityGateTexts.shieldTooltip}
      className={BADGE_CLASS}
    >
      <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
      <span>{securityGateTexts.shieldBadge}</span>
    </button>
  );
}
