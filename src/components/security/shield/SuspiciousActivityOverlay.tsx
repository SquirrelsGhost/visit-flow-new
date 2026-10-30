// Needs window reload action when security lock screen is triggered
"use client";

import { ShieldAlert } from "lucide-react";
import { getFingerprint } from "@/lib/security/fingerprint";
import { securityGateTexts } from "@/texts/securityGateTexts";

interface SuspiciousActivityOverlayProps {
  locked: boolean;
  reason?: string;
}

const OVERLAY_CLASS =
  "fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/95 p-6 backdrop-blur-xl";
const CARD_CLASS =
  "w-full max-w-md rounded-2xl border border-rose-500/40 bg-slate-900 p-6 text-center shadow-2xl";

export default function SuspiciousActivityOverlay({
  locked,
  reason,
}: SuspiciousActivityOverlayProps) {
  if (!locked) return null;

  return (
    <div role="alertdialog" aria-modal="true" className={OVERLAY_CLASS}>
      <div className={CARD_CLASS}>
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/15 text-rose-400">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h2 className="text-lg font-bold text-white">{securityGateTexts.lockOverlayTitle}</h2>
        <p className="mt-2 text-xs leading-relaxed text-slate-300">
          {securityGateTexts.lockOverlayBody}
        </p>
        <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950/80 p-2.5 font-mono text-[11px] text-rose-300">
          Code: {reason || "SECURITY_VIOLATION"} • ID: {getFingerprint()}
        </div>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-5 w-full rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-rose-500"
        >
          {securityGateTexts.lockOverlayButton}
        </button>
      </div>
    </div>
  );
}
