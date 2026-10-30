// Needs session and contract actions for legal, AGB, privacy & KYC overview
"use client";

import { ArrowLeft, BadgeCheck, Download, FileSignature, Fingerprint, Scale, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { generateAndDownloadSecurityPdf } from "@/lib/security/generateSecurityPdf";
import {
  getAcceptedTerms,
  getLeaderIdent,
  openLeaderIdentModal,
  openSecurityContractModal,
  SECURITY_CONTRACT_UPDATED_EVENT,
} from "@/lib/security/securityContractStore";
import { CONSENT_OPEN_EVENT } from "@/shared/consent/consent";
import {
  POLICY_DOCUMENT_SUBTITLE,
  POLICY_DOCUMENT_TITLE,
  POLICY_PREAMBLE,
  POLICY_SECTIONS,
} from "@/texts/securityPolicyTexts";

const CARD_CLASS =
  "rounded-2xl border border-slate-800/80 bg-slate-900/70 p-5 shadow-lg backdrop-blur-md";

export interface PrivacySettingsViewProps { readonly _?: never; }

export default function PrivacySettingsView() {
  const { user } = useAuth();
  const [, setTick] = useState(0);

  useEffect(() => {
    const refresh = () => setTick((v) => v + 1);
    window.addEventListener(SECURITY_CONTRACT_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(SECURITY_CONTRACT_UPDATED_EVENT, refresh);
  }, []);

  const accepted = getAcceptedTerms(user?.id);
  const ident = getLeaderIdent(user?.id);

  const handlePdfDownload = async () => {
    await generateAndDownloadSecurityPdf({
      userName: user?.name || "Nutzer",
      userEmail: user?.email || "",
      userRole: user?.role || "Partner",
      userAddress: accepted?.address,
      fingerprint: accepted?.fingerprint,
      acceptedAt: accepted?.acceptedAt,
      signatureDataUrl: accepted?.signaturePng,
      leaderIdent: ident,
    });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/settings" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5" />
            Zurück zu den Einstellungen
          </Link>
          <h1 className="mt-1 text-xl font-bold text-white">{POLICY_DOCUMENT_TITLE}</h1>
          <p className="text-xs text-emerald-400">{POLICY_DOCUMENT_SUBTITLE}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => void handlePdfDownload()} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/90 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-700">
            <Download className="h-4 w-4 text-emerald-400" />
            PDF herunterladen
          </button>
          <button type="button" onClick={openSecurityContractModal} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-500">
            <FileSignature className="h-4 w-4" />
            {accepted ? `Signiert (${accepted.version})` : "Vertrag digital unterzeichnen"}
          </button>
          <button type="button" onClick={openLeaderIdentModal} className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-950/30 px-3.5 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-950/50">
            <Fingerprint className="h-4 w-4" />
            {ident ? `KYC: ${ident.verificationHash}` : "Online-Ident (KYC)"}
          </button>
        </div>
      </div>

      <div className={CARD_CLASS}>
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
          <div className="space-y-2 text-xs leading-relaxed text-slate-300">
            <p className="font-semibold text-white">Rechtsträger & Anbieterkennzeichnung (Impressum & Datenschutz)</p>
            <p>{POLICY_PREAMBLE}</p>
            <div className="flex flex-wrap gap-3 pt-1">
              <button type="button" onClick={() => window.dispatchEvent(new CustomEvent(CONSENT_OPEN_EVENT))} className="text-emerald-400 underline hover:text-emerald-300">
                Datenschutz-Einwilligungen (Art. 7 Abs. 3 DSGVO) anpassen
              </button>
              {ident && (
                <span className="inline-flex items-center gap-1 text-emerald-300">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Führungskräfte-Ident bestätigt ({ident.docNumber})
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {POLICY_SECTIONS.map((sec) => (
          <section key={sec.id} className={CARD_CLASS}>
            <h2 className="flex items-center gap-2 text-sm font-bold text-white">
              <Scale className="h-4 w-4 text-emerald-400" />
              {sec.heading}
            </h2>
            {sec.paragraphs.map((p, i) => (
              <p key={i} className="mt-2 text-xs leading-relaxed text-slate-300">
                {p}
              </p>
            ))}
            {sec.bullets && (
              <ul className="mt-2.5 list-disc space-y-1.5 pl-5 text-xs text-slate-300">
                {sec.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
