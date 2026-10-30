import { useEffect, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { feedback } from "@/lib/feedback/feedback";
import { getFingerprint } from "@/lib/security/fingerprint";
import { generateAndDownloadSecurityPdf } from "@/lib/security/generateSecurityPdf";
import { getAcceptedTerms, getGateDraft, getLeaderIdent, hasAcceptedCurrentTerms, isLeaderRole, openLeaderIdentModal, saveAcceptedTerms, saveGateDraft, SECURITY_GATE_OPEN_EVENT, type SecurityAcceptanceRecord } from "@/lib/security/securityContractStore";
import { securityGateTexts } from "@/texts/securityGateTexts";

export type GateStep = 1 | 2 | 3;

interface GateUser {
  userId?: string | null;
  userName?: string | null;
  userEmail?: string | null;
  userRole?: string | null;
}

const MIN_ADDRESS = 8;
/** Kurz warten, bis der Vertrag ausgeblendet ist, dann erscheint das Online-Ident. */
const IDENT_HANDOFF_MS = 320;
const subscribeNever = () => () => {};

/** Zustand des Sicherheitsvertrags: Entwurf laden und sichern, Schritte prüfen, Unterschrift speichern, an das Ident übergeben. */
export function useSecurityGate({ userId, userName, userEmail, userRole }: GateUser) {
  const mounted = useSyncExternalStore(subscribeNever, () => true, () => false);
  const [hydratedFor, setHydratedFor] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [record, setRecord] = useState<SecurityAcceptanceRecord | null>(null);
  const [accepted, setAccepted] = useState(true);
  const [step, setStep] = useState<GateStep>(1);
  const [address, setAddressRaw] = useState("");
  const [pdfDownloaded, setPdfDownloaded] = useState(false);
  const [signaturePng, setSignaturePng] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [done, setDone] = useState(false);

  /** Beim ersten Rendern im Browser den Entwurf bzw. den unterschriebenen Vertrag übernehmen (kein Effect nötig). */
  if (mounted && userId && hydratedFor !== userId) {
    const draft = getGateDraft(userId);
    const existing = getAcceptedTerms(userId);
    const isAccepted = hasAcceptedCurrentTerms(userId);
    setHydratedFor(userId);
    setRecord(existing);
    setAccepted(isAccepted);
    setDone(isAccepted);
    setOpen(!isAccepted);
    if (draft) {
      setStep(draft.step);
      setAddressRaw(draft.address);
      setPdfDownloaded(draft.pdfDownloaded);
      setSignaturePng(draft.signaturePng);
      setChecked(draft.checked);
    } else if (existing) {
      setAddressRaw(existing.address);
      setPdfDownloaded(true);
      setSignaturePng(existing.signaturePng);
      setChecked(true);
    }
  }
  const hydrated = Boolean(userId) && hydratedFor === userId;

  useEffect(() => {
    if (userId && hydrated && !accepted) saveGateDraft(userId, { step, address, pdfDownloaded, signaturePng, checked });
  }, [userId, hydrated, accepted, step, address, pdfDownloaded, signaturePng, checked]);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(SECURITY_GATE_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(SECURITY_GATE_OPEN_EVENT, onOpen);
  }, []);

  const isLeader = isLeaderRole(userRole);
  const needsIdent = isLeader && !getLeaderIdent(userId);
  const addressValid = address.trim().length >= MIN_ADDRESS;
  const valid: Record<GateStep, boolean> = { 1: true, 2: addressValid && pdfDownloaded, 3: addressValid && pdfDownloaded && Boolean(signaturePng) && checked };

  /** Neue Anschrift = neues PDF, sonst stünde im geprüften Dokument eine andere Anschrift. */
  const setAddress = (value: string) => {
    setAddressRaw(value);
    setPdfDownloaded(false);
  };

  const downloadPdf = async (withSignature = false) => {
    await generateAndDownloadSecurityPdf({
      userName: userName || "Nutzer",
      userEmail: userEmail || "",
      userRole: userRole || "Vertriebspartner",
      userAddress: address.trim() || "Noch nicht eingetragen",
      fingerprint: getFingerprint(),
      acceptedAt: withSignature ? record?.acceptedAt : undefined,
      signatureDataUrl: withSignature ? (record?.signaturePng ?? signaturePng) : signaturePng,
      leaderIdent: getLeaderIdent(userId),
    });
    if (!withSignature) setPdfDownloaded(true);
  };

  const submit = () => {
    if (!userId || !valid[3] || !signaturePng) return;
    const saved = saveAcceptedTerms({ userId, userName: userName || "Nutzer", userEmail: userEmail || "", role: userRole || "partner", address: address.trim(), signaturePng });
    setRecord(saved);
    setAccepted(true);
    setDone(true);
    feedback("success");
    toast.success(securityGateTexts.gateSavedToast);
  };

  /** Schließen geht erst nach der Unterschrift; beim nächsten Öffnen erscheint wieder die Übersicht. */
  const close = () => {
    if (!accepted) return;
    setOpen(false);
    setDone(true);
  };

  /** Nahtlos weiter: Vertrag schließen und direkt das Online-Ident öffnen. */
  const continueToIdent = () => {
    close();
    window.setTimeout(openLeaderIdentModal, IDENT_HANDOFF_MS);
  };

  return { open: hydrated && open, accepted, done, review: () => { setDone(false); setStep(1); }, step, setStep, address, setAddress, addressValid, pdfDownloaded, downloadPdf, signaturePng, setSignaturePng, checked, setChecked, valid, isLeader, needsIdent, record, submit, close, continueToIdent };
}
