// Needs session and contract store listeners to verify Leader Online-Ident before license assignment
"use client";

import { BadgeCheck, Fingerprint, PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { emailProblem } from "../../../lib/licenses/licenseLogic";
import type { TeamLicenses } from "../../../lib/licenses/licenseTypes";
import { formatEuro, LICENSE_PRICE } from "../../../lib/onboarding/licenses";
import {
  getLeaderIdent,
  openLeaderIdentModal,
  requiresIdentForAssign,
  SECURITY_CONTRACT_UPDATED_EVENT,
} from "../../../lib/security/securityContractStore";
import { licenseTexts } from "../../../texts/licenseTexts";
import { fill } from "../../../texts/profileTexts";
import { securityGateTexts } from "../../../texts/securityGateTexts";
import GlassSheet from "../../glass/GlassSheet";
import EmailForm from "./EmailForm";
import SheetNote from "./SheetNote";

interface AssignSheetProps {
  open: boolean;
  data: TeamLicenses;
  busy: boolean;
  onClose: () => void;
  onAssign: (email: string) => Promise<boolean>;
}

const texts = licenseTexts.sheets.assign;

/** Lizenz an eine E-Mail vergeben; für Teamleiter mit Online-Ident-Prüfung (§ 3.1 / § 278 BGB). */
export default function AssignSheet({ open, data, busy, onClose, onAssign }: AssignSheetProps) {
  const { user } = useAuth();
  const [, setTick] = useState(0);

  useEffect(() => {
    const refresh = () => setTick((v) => v + 1);
    window.addEventListener(SECURITY_CONTRACT_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(SECURITY_CONTRACT_UPDATED_EVENT, refresh);
  }, []);

  const ident = getLeaderIdent(user?.id);
  const identRequired = requiresIdentForAssign(user?.role) && !ident;
  const full = data.licensedEmails.length >= data.licenseCount;

  const validate = (email: string) => {
    if (identRequired) return securityGateTexts.assignIdentGateTitle;
    const problem = emailProblem(email, data);
    return problem ? licenseTexts.errors[problem] : null;
  };
  const submit = async (email: string) => {
    const ok = await onAssign(email);
    if (ok) onClose();
    return ok;
  };

  return (
    <GlassSheet open={open} onClose={onClose} title={texts.title} subtitle={texts.text}>
      <div className="mb-3 rounded-xl border border-slate-700/60 bg-slate-900/60 p-3 text-xs">
        {ident ? (
          <div className="flex items-center justify-between text-emerald-300">
            <span className="flex items-center gap-1.5 font-medium">
              <BadgeCheck className="h-4 w-4 text-emerald-400" />
              Online-Ident & § 278 BGB Bürgschaft aktiv ({ident.verificationHash})
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-slate-300">{securityGateTexts.assignIdentGateText}</span>
            <button
              type="button"
              onClick={openLeaderIdentModal}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-500/25"
            >
              <Fingerprint className="h-3.5 w-3.5" />
              {securityGateTexts.assignIdentGateButton}
            </button>
          </div>
        )}
      </div>
      <EmailForm
        label={texts.email}
        confirmLabel={full ? texts.confirmAdd : texts.confirm}
        busyLabel={texts.saving}
        busy={busy}
        validate={validate}
        onSubmit={submit}
        hint={full && <SheetNote icon={PlusCircle} tone="warn">{fill(texts.noFree, { price: formatEuro(LICENSE_PRICE) })}</SheetNote>}
      />
    </GlassSheet>
  );
}
