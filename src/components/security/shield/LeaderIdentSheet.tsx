// Needs state and custom event listener for 4-step Leader Online-Ident (KYC & Live-Video) wizard
"use client";

import { Fingerprint, ShieldCheck } from "lucide-react";
import { useState } from "react";
import IdentDialog from "@/components/security/ident/IdentDialog";
import IdentFooter from "@/components/security/ident/IdentFooter";
import IdentJourneyNote from "@/components/security/ident/IdentJourneyNote";
import IdentProgressBar from "@/components/security/ident/IdentProgressBar";
import IdentRail from "@/components/security/ident/IdentRail";
import IdentStage from "@/components/security/ident/IdentStage";
import IdentStepData from "@/components/security/ident/IdentStepData";
import IdentStepLiability from "@/components/security/ident/IdentStepLiability";
import { IDENT_STEP_ICONS } from "@/components/security/ident/identStepIcons";
import IdentTopBar from "@/components/security/ident/IdentTopBar";
import IdentVerifiedBanner from "@/components/security/ident/IdentVerifiedBanner";
import { useLeaderIdent } from "@/hooks/useLeaderIdent";
import { feedback } from "@/lib/feedback/feedback";
import { firstInvalidField, IDENT_STEP_COUNT, type IdentStep } from "@/lib/security/identWizard";
import { contractWizardTexts } from "@/texts/contractWizardTexts";
import { identWizardTexts } from "@/texts/identWizardTexts";
import { securityGateTexts } from "@/texts/securityGateTexts";
import IdCardCaptureRow from "./IdCardCaptureRow";
import LiveVideoIdentRecorder from "./LiveVideoIdentRecorder";

interface LeaderIdentSheetProps {
  userId?: string | null;
  defaultName?: string | null;
}

const AUTO_ADVANCE_MS = 1400;

const STEP_HINTS: Record<IdentStep, string | null> = {
  1: null,
  2: identWizardTexts.scanMissing,
  3: identWizardTexts.videoMissing,
  4: identWizardTexts.liabilityMissing,
};

/** Online-Ident (KYC) & Team-Bürgschaft als geführter Ablauf in vier Schritten, ein Schritt pro Ansicht. */
export default function LeaderIdentSheet({ userId, defaultName }: LeaderIdentSheetProps) {
  const ident = useLeaderIdent(userId, defaultName);
  const { step, state, update, valid } = ident;
  const [attempt, setAttempt] = useState({ step, count: 0 });
  const attempts = attempt.step === step ? attempt.count : 0;

  if (!userId) return null;

  const goTo = (next: number) => {
    feedback("select");
    ident.setStep(next as IdentStep);
  };
  const meta = identWizardTexts.steps[step - 1];
  const journey = <IdentJourneyNote icon={ShieldCheck} label={contractWizardTexts.journey.signed} title={contractWizardTexts.journey.contract} state="done" />;

  /** Nach einem automatisch abgeschlossenen Schritt kurz das Ergebnis zeigen, dann von selbst weiter. */
  const autoAdvance = (from: IdentStep) => {
    window.setTimeout(() => ident.setStep((current) => (current === from ? ((from + 1) as IdentStep) : current)), AUTO_ADVANCE_MS);
  };

  const handlePrimary = () => {
    if (!valid[step]) {
      feedback("warning");
      setAttempt({ step, count: attempts + 1 });
      const field = step === 1 ? firstInvalidField(state) : null;
      if (field) document.getElementById(`ident-field-${field}`)?.focus();
      return;
    }
    if (step < 4) goTo(step + 1);
    else void ident.save();
  };

  return (
    <IdentDialog open={ident.open} onClose={ident.close} label={securityGateTexts.identTitle} aside={<IdentRail icon={Fingerprint} eyebrow={identWizardTexts.eyebrow} title={securityGateTexts.identTitle} subtitle={securityGateTexts.identSubtitle} steps={identWizardTexts.steps} icons={IDENT_STEP_ICONS} step={step} onSelectStep={goTo} journey={journey} />}>
      <IdentTopBar icon={Fingerprint} eyebrow={identWizardTexts.eyebrow} progressText={`${contractWizardTexts.partOf(2, 2)} · ${identWizardTexts.stepOf(step, IDENT_STEP_COUNT)}`} onClose={ident.close} />
      <IdentProgressBar steps={identWizardTexts.steps} step={step} label={identWizardTexts.progressLabel} />
      {ident.existing && <IdentVerifiedBanner record={ident.existing} />}
      <IdentStage step={step} title={meta.title} text={meta.text}>
        {step === 1 && <IdentStepData state={state} onChange={update} showAllErrors={attempts > 0} />}
        {step === 2 && <IdCardCaptureRow frontVerified={state.frontVerified} backVerified={state.backSelfieVerified} frontDataUrl={state.frontDataUrl} backDataUrl={state.backDataUrl} onFrontChange={(v, u) => update({ frontVerified: v, frontDataUrl: u })} onBackChange={(v, u) => update({ backSelfieVerified: v, backDataUrl: u })} onComplete={() => autoAdvance(2)} />}
        {step === 3 && <LiveVideoIdentRecorder fullName={state.fullName} challenge={{ spokenPin: state.spokenPin, movements: ["1. Links", "2. Rechts", "3. Oben"] }} verified={Boolean(state.videoSha256)} videoSha256={state.videoSha256} onVerified={(hash, url) => { update({ videoSha256: hash, videoDataUrl: url }); autoAdvance(3); }} />}
        {step === 4 && <IdentStepLiability state={state} onChange={update} onEditStep={goTo} />}
      </IdentStage>
      <IdentFooter
        showBack={step > 1}
        onBack={() => goTo(step - 1)}
        final={step === 4}
        label={step === 4 ? identWizardTexts.submitShort : identWizardTexts.next(step + 1)}
        ariaLabel={step === 4 ? securityGateTexts.identSubmitButton : undefined}
        ready={valid[step]}
        onPrimary={handlePrimary}
        hint={attempts > 0 && !valid[step] ? STEP_HINTS[step] : null}
        attempt={attempts}
      />
    </IdentDialog>
  );
}
