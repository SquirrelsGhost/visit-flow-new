import { useEffect, useState } from "react";
import { toast } from "sonner";
import { feedback } from "@/lib/feedback/feedback";
import { isPersonalDataValid, type IdentStep } from "@/lib/security/identWizard";
import { createKycChallenge, saveKycVaultEntry } from "@/lib/security/kycVault";
import { getIdentDraft, getLeaderIdent, hasAcceptedCurrentTerms, LEADER_IDENT_OPEN_EVENT, openSecurityContractModal, type LeaderIdentDraft, type LeaderIdentRecord, saveIdentDraft, saveLeaderIdent } from "@/lib/security/securityContractStore";
import { securityGateTexts } from "@/texts/securityGateTexts";

export type IdentState = Omit<LeaderIdentDraft, "step">;

const emptyState = (name: string): IdentState => ({
  fullName: name,
  birthDate: "",
  docType: "personalausweis",
  docNumber: "",
  authority: "",
  address: "",
  frontVerified: false,
  backSelfieVerified: false,
  frontDataUrl: null,
  backDataUrl: null,
  spokenPin: createKycChallenge().spokenPin,
  videoSha256: null,
  videoDataUrl: "",
  liabilityAccepted: false,
});

function fromRecord(saved: LeaderIdentRecord, base: IdentState): IdentState {
  const { fullName, birthDate, docType, docNumber, authority, address, frontVerified, backSelfieVerified, liabilityAccepted } = saved;
  return { ...base, fullName, birthDate, docType, docNumber, authority, address, frontVerified, backSelfieVerified, liabilityAccepted, videoSha256: saved.videoSha256 ?? null };
}

/** Zustand des Online-Ident-Ablaufs: Entwurf laden und laufend sichern, Schritte prüfen, Ergebnis speichern. */
export function useLeaderIdent(userId?: string | null, defaultName?: string | null) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<IdentStep>(1);
  const [state, setState] = useState<IdentState>(() => emptyState(defaultName || ""));
  const [existing, setExisting] = useState<LeaderIdentRecord | null>(null);
  const [hydratedFor, setHydratedFor] = useState<string | null>(null);
  const hydrated = Boolean(userId) && hydratedFor === userId;

  useEffect(() => {
    if (userId && hydrated) saveIdentDraft(userId, { step, ...state });
  }, [userId, hydrated, step, state]);

  useEffect(() => {
    /** Entwurf bzw. gespeicherte Verifizierung erst beim Öffnen laden, dann weiter wie zuletzt verlassen. */
    const onOpen = () => {
      // Das Online-Ident kommt erst nach dem unterschriebenen Sicherheitsvertrag; der leitet danach selbst hierher.
      if (userId && !hasAcceptedCurrentTerms(userId)) {
        openSecurityContractModal();
        return;
      }
      if (userId && hydratedFor !== userId) {
        const draft = getIdentDraft(userId);
        const saved = getLeaderIdent(userId);
        const base = emptyState(defaultName || "");
        if (draft) {
          const { step: draftStep, ...rest } = draft;
          setStep(draftStep);
          setState({ ...rest, fullName: rest.fullName || base.fullName, spokenPin: rest.spokenPin || base.spokenPin });
        } else {
          setStep(1);
          setState(saved ? fromRecord(saved, base) : base);
        }
        setExisting(saved);
        setHydratedFor(userId);
      }
      setOpen(true);
    };
    window.addEventListener(LEADER_IDENT_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(LEADER_IDENT_OPEN_EVENT, onOpen);
  }, [userId, defaultName, hydratedFor]);

  const update = (patch: Partial<IdentState>) => setState((s) => ({ ...s, ...patch }));

  const valid: Record<IdentStep, boolean> = { 1: false, 2: false, 3: false, 4: false };
  valid[1] = isPersonalDataValid(state);
  valid[2] = valid[1] && state.frontVerified && state.backSelfieVerified;
  valid[3] = valid[2] && Boolean(state.videoSha256);
  valid[4] = valid[3] && state.liabilityAccepted;

  const save = async () => {
    if (!userId || !valid[4]) return;
    const s = state;
    const saved = saveLeaderIdent({ userId, fullName: s.fullName.trim(), birthDate: s.birthDate.trim(), docType: s.docType, docNumber: s.docNumber.trim().toUpperCase(), authority: s.authority.trim(), address: s.address.trim(), frontVerified: s.frontVerified, backSelfieVerified: s.backSelfieVerified, liabilityAccepted: s.liabilityAccepted, gdprStorageConsent: true, livenessVerified: Boolean(s.videoSha256), spokenPin: s.spokenPin, videoSha256: s.videoSha256 ?? undefined });
    await saveKycVaultEntry({ userId, spokenPin: s.spokenPin, videoSha256: s.videoSha256 ?? saved.verificationHash, videoMimeType: "video/webm", videoDataUrl: s.videoDataUrl, frontIdDataUrl: s.frontDataUrl ?? "", backIdDataUrl: s.backDataUrl ?? "", recordedAt: saved.verifiedAt });
    setExisting(saved);
    setOpen(false);
    feedback("success");
    toast.success(securityGateTexts.identSavedToast);
  };

  return { open, close: () => setOpen(false), step, setStep, state, update, valid, existing, save };
}
