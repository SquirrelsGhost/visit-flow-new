// Braucht Zustand, Speicher im Browser und Ereignisse für den geführten Sicherheitsvertrag
"use client";

import { Fingerprint, ShieldCheck } from "lucide-react";
import { useState } from "react";
import ContractDone from "@/components/security/contract/ContractDone";
import ContractStepAddress from "@/components/security/contract/ContractStepAddress";
import ContractStepRead from "@/components/security/contract/ContractStepRead";
import ContractStepSign from "@/components/security/contract/ContractStepSign";
import { CONTRACT_STEP_ICONS } from "@/components/security/contract/contractStepIcons";
import IdentDialog from "@/components/security/ident/IdentDialog";
import IdentFooter from "@/components/security/ident/IdentFooter";
import IdentJourneyNote from "@/components/security/ident/IdentJourneyNote";
import IdentProgressBar from "@/components/security/ident/IdentProgressBar";
import IdentRail from "@/components/security/ident/IdentRail";
import IdentStage from "@/components/security/ident/IdentStage";
import IdentTopBar from "@/components/security/ident/IdentTopBar";
import { type GateStep, useSecurityGate } from "@/hooks/useSecurityGate";
import { feedback } from "@/lib/feedback/feedback";
import { contractWizardTexts as t } from "@/texts/contractWizardTexts";
import { securityGateTexts } from "@/texts/securityGateTexts";

interface SecurityAcceptanceGateProps {
  userId?: string | null;
  userName?: string | null;
  userEmail?: string | null;
  userRole?: string | null;
}

const STEP_COUNT = 3;
const DONE_PHASE = 4;

/** Sicherheitsvertrag als geführter Ablauf: lesen, Anschrift & PDF, unterschreiben; Führungskräfte gehen danach direkt ins Online-Ident. */
export default function SecurityAcceptanceGate(props: SecurityAcceptanceGateProps) {
  const gate = useSecurityGate(props);
  const { step, done, valid, isLeader, needsIdent } = gate;
  const [attempt, setAttempt] = useState({ step, count: 0 });
  const attempts = attempt.step === step ? attempt.count : 0;

  if (!props.userId) return null;

  const phase = done ? DONE_PHASE : step;
  const meta = done ? { title: t.done.title, text: t.done.text } : t.steps[step - 1];

  const goTo = (next: number) => {
    feedback("select");
    if (done) gate.review();
    gate.setStep(next as GateStep);
  };

  const missingHint = () => {
    if (step === 2) return gate.addressValid ? t.missing.pdf : t.missing.address;
    if (step === 3) return gate.signaturePng ? t.missing.consent : t.missing.signature;
    return null;
  };

  const handlePrimary = () => {
    if (done) return needsIdent ? gate.continueToIdent() : gate.close();
    if (!valid[step]) {
      feedback("warning");
      setAttempt({ step, count: attempts + 1 });
      if (step === 2 && !gate.addressValid) document.getElementById("contract-field-address")?.focus();
      return;
    }
    if (step < STEP_COUNT) goTo(step + 1);
    else gate.submit();
  };

  const journey = isLeader && <IdentJourneyNote icon={Fingerprint} label={t.journey.then} title={t.journey.ident} state={needsIdent ? "next" : "done"} />;

  return (
    <IdentDialog
      open={gate.open}
      onClose={gate.close}
      dismissible={gate.accepted}
      label={securityGateTexts.gateTitle}
      aside={<IdentRail icon={ShieldCheck} eyebrow={t.eyebrow} title={securityGateTexts.gateTitle} subtitle={securityGateTexts.gateBadge} steps={t.steps} icons={CONTRACT_STEP_ICONS} step={phase} onSelectStep={goTo} journey={journey} />}
    >
      <IdentTopBar icon={ShieldCheck} eyebrow={t.eyebrow} progressText={`${isLeader ? `${t.partOf(1, 2)} · ` : ""}${done ? t.doneOf : t.stepOf(step, STEP_COUNT)}`} onClose={gate.accepted ? gate.close : undefined} />
      <IdentProgressBar steps={t.steps} step={phase} label={t.progressLabel} />
      <IdentStage step={phase} title={meta.title} text={meta.text}>
        {done && <ContractDone record={gate.record} needsIdent={needsIdent} onContinue={gate.continueToIdent} onDownload={() => gate.downloadPdf(true)} onReview={gate.review} />}
        {!done && step === 1 && <ContractStepRead isLeader={isLeader} />}
        {!done && step === 2 && <ContractStepAddress address={gate.address} onAddressChange={gate.setAddress} addressValid={gate.addressValid} showError={attempts > 0} pdfDownloaded={gate.pdfDownloaded} onDownload={() => gate.downloadPdf()} />}
        {!done && step === 3 && <ContractStepSign isLeader={isLeader} signaturePng={gate.signaturePng} onSignature={gate.setSignaturePng} checked={gate.checked} onCheckedChange={gate.setChecked} />}
      </IdentStage>
      <IdentFooter
        showBack={!done && step > 1}
        onBack={() => goTo(step - 1)}
        final={!done && step === STEP_COUNT}
        label={done ? (needsIdent ? t.done.toIdent : t.done.finish) : step === STEP_COUNT ? t.submitShort : t.next(step + 1)}
        ariaLabel={!done && step === STEP_COUNT ? securityGateTexts.gateSubmitButton : undefined}
        ready={done || valid[step]}
        onPrimary={handlePrimary}
        hint={!done && attempts > 0 && !valid[step] ? missingHint() : null}
        attempt={attempts}
      />
    </IdentDialog>
  );
}
