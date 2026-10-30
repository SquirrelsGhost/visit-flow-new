import { BadgeCheck } from "lucide-react";
import type { LeaderIdentRecord } from "@/lib/security/securityContractStore";
import { securityGateTexts } from "@/texts/securityGateTexts";

interface IdentVerifiedBannerProps {
  record: LeaderIdentRecord;
}

/** Hinweis oben, wenn bereits eine gültige Verifizierung vorliegt (Ablauf dient dann zum Aktualisieren). */
export default function IdentVerifiedBanner({ record }: IdentVerifiedBannerProps) {
  return (
    <div className="mx-5 mt-4 flex items-center gap-3 rounded-2xl bg-emerald-500/[0.08] px-4 py-3 ring-1 ring-inset ring-emerald-500/30 lg:mx-8">
      <BadgeCheck className="h-5 w-5 shrink-0 text-emerald-500" />
      <p className="min-w-0 flex-1 text-[13px] font-semibold text-emerald-800 dark:text-emerald-200">
        {securityGateTexts.identBadgeVerified} <span className="font-mono text-[12px] font-medium opacity-75">({record.verificationHash})</span>
      </p>
      <span className="shrink-0 text-[12px] text-emerald-700/80 dark:text-emerald-300/80">{new Date(record.verifiedAt).toLocaleDateString("de-DE")}</span>
    </div>
  );
}
