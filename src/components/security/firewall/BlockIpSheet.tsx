// Formular-Zustand lebt im Browser
"use client";

import { useState, type FormEvent } from "react";
import { useSecurityTexts } from "../../../hooks/useSecurityTexts";
import { isValidIpv4 } from "../../../lib/security/securityLogic";
import GlassSheet from "../../glass/GlassSheet";
import GlassSwitch from "../../glass/GlassSwitch";
import SheetButton from "../../licenses/sheets/SheetButton";
import FormError from "../../profile/FormError";
import SheetField from "../shared/SheetField";

interface BlockIpSheetProps {
  open: boolean;
  /** IPs auf der Whitelist lassen sich nicht sperren (v1-Server ignoriert sie sonst still). */
  whitelisted: readonly string[];
  onClose: () => void;
  onBlock: (ip: string, reason: string, permanent: boolean) => Promise<boolean>;
}

/** IP von Hand sperren (v1 POST /security/ddos/block): Adresse, Grund, dauerhaft oder befristet. */
export default function BlockIpSheet({ open, whitelisted, onClose, onBlock }: BlockIpSheetProps) {
  const t = useSecurityTexts();
  const f = t.firewall;
  const [ip, setIp] = useState("");
  const [reason, setReason] = useState("");
  const [permanent, setPermanent] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const close = () => {
    setIp("");
    setReason("");
    setPermanent(true);
    setError(null);
    onClose();
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const clean = ip.trim();
    const problem = !isValidIpv4(clean) ? f.ipInvalid : whitelisted.includes(clean) ? f.ipWhitelisted : null;
    setError(problem);
    if (problem || !reason.trim()) return;
    setBusy(true);
    const ok = await onBlock(clean, reason.trim(), permanent);
    setBusy(false);
    if (ok) close();
  };

  return (
    <GlassSheet open={open} onClose={close} title={f.blockTitle} subtitle={f.blockText}>
      <form onSubmit={submit} noValidate className="space-y-4">
        <SheetField label={f.ip} value={ip} onChange={(v) => {
          setIp(v);
          setError(null);
        }} inputMode="decimal" autoComplete="off" autoFocus placeholder="203.0.113.7" />
        <FormError message={error} />
        <SheetField label={f.reasonField} value={reason} onChange={setReason} placeholder={f.reasonPlaceholder} maxLength={200} />
        <button type="button" role="switch" aria-checked={permanent} onClick={() => setPermanent((p) => !p)} className="flex w-full items-center gap-3 rounded-2xl px-1 py-1 text-left">
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-semibold text-foreground">{f.permanentField}</span>
            <span className="mt-0.5 block text-[12.5px] text-muted-foreground">{f.permanentHint}</span>
          </span>
          <GlassSwitch checked={permanent} />
        </button>
        <SheetButton type="submit" label={f.blockConfirm} busyLabel={t.busy} busy={busy} disabled={!ip.trim() || !reason.trim()} />
      </form>
    </GlassSheet>
  );
}
