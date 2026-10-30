import { IdCard, MapPin, UserRound, Video } from "lucide-react";
import { GLASS_DIVIDER } from "@/components/glass/glassStyles";
import type { IdentState } from "@/hooks/useLeaderIdent";
import { cn } from "@/lib/cn";
import type { IdentStep } from "@/lib/security/identWizard";
import { identWizardTexts } from "@/texts/identWizardTexts";
import { securityGateTexts } from "@/texts/securityGateTexts";
import IdentLiabilityConsent from "./IdentLiabilityConsent";
import IdentSummaryRow from "./IdentSummaryRow";

interface IdentStepLiabilityProps {
  state: IdentState;
  onChange: (patch: Partial<IdentState>) => void;
  onEditStep: (step: IdentStep) => void;
}

const DOC_LABEL = {
  personalausweis: securityGateTexts.identDocTypeIdCard,
  reisepass: securityGateTexts.identDocTypePassport,
  aufenthaltstitel: securityGateTexts.identDocTypeResidence,
} as const;

const formatDate = (iso: string) => (iso ? new Date(`${iso}T00:00:00`).toLocaleDateString("de-DE") : "");

/** Schritt 4: alle Angaben auf einen Blick, darunter die verbindliche Bürgschaft. */
export default function IdentStepLiability({ state, onChange, onEditStep }: IdentStepLiabilityProps) {
  return (
    <div className="space-y-6">
      <section>
        <h4 className="px-1 pb-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--glass-label)]">{identWizardTexts.summaryTitle}</h4>
        <div className={cn("glass-surface overflow-hidden rounded-[22px]", GLASS_DIVIDER, "[&>*+*]:before:left-[3.75rem]")}>
          <IdentSummaryRow icon={UserRound} tone="blue" label={identWizardTexts.summaryPerson} value={state.fullName} detail={formatDate(state.birthDate)} onEdit={() => onEditStep(1)} />
          <IdentSummaryRow icon={IdCard} tone="indigo" label={identWizardTexts.summaryDocument} value={`${DOC_LABEL[state.docType]} · ${state.docNumber.toUpperCase()}`} detail={state.authority} onEdit={() => onEditStep(1)} />
          <IdentSummaryRow icon={MapPin} tone="orange" label={identWizardTexts.summaryAddress} value={state.address} onEdit={() => onEditStep(1)} />
          <IdentSummaryRow icon={Video} tone="green" label={identWizardTexts.summaryVideo} value={`${state.videoSha256?.slice(0, 24) ?? ""}…`} detail={identWizardTexts.summaryPin(state.spokenPin)} mono onEdit={() => onEditStep(3)} />
        </div>
      </section>
      <IdentLiabilityConsent checked={state.liabilityAccepted} onChange={(liabilityAccepted) => onChange({ liabilityAccepted })} />
    </div>
  );
}
