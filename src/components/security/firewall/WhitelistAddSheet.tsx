// Formular-Zustand lebt im Browser
"use client";

import { useState, type FormEvent } from "react";
import { useSecurityTexts } from "../../../hooks/useSecurityTexts";
import { isValidIpv4 } from "../../../lib/security/securityLogic";
import GlassSheet from "../../glass/GlassSheet";
import SheetButton from "../../licenses/sheets/SheetButton";
import FormError from "../../profile/FormError";
import SheetField from "../shared/SheetField";

interface WhitelistAddSheetProps {
  open: boolean;
  onClose: () => void;
  onAdd: (ip: string, comment: string) => Promise<boolean>;
}

/** IP auf die Whitelist setzen (v1 POST /security/whitelist) mit einer Notiz, wofür sie steht. */
export default function WhitelistAddSheet({ open, onClose, onAdd }: WhitelistAddSheetProps) {
  const t = useSecurityTexts();
  const [ip, setIp] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const close = () => {
    setIp("");
    setComment("");
    setError(null);
    onClose();
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const clean = ip.trim();
    if (!isValidIpv4(clean)) return setError(t.firewall.ipInvalid);
    setBusy(true);
    const ok = await onAdd(clean, comment.trim());
    setBusy(false);
    if (ok) close();
  };

  return (
    <GlassSheet open={open} onClose={close} title={t.whitelist.addTitle} subtitle={t.whitelist.addText}>
      <form onSubmit={submit} noValidate className="space-y-4">
        <SheetField label={t.firewall.ip} value={ip} onChange={(v) => {
          setIp(v);
          setError(null);
        }} inputMode="decimal" autoComplete="off" autoFocus placeholder="203.0.113.7" />
        <FormError message={error} />
        <SheetField label={t.whitelist.comment} value={comment} onChange={setComment} placeholder={t.whitelist.commentPlaceholder} maxLength={120} />
        <SheetButton type="submit" label={t.whitelist.addConfirm} busyLabel={t.busy} busy={busy} disabled={!ip.trim()} />
      </form>
    </GlassSheet>
  );
}
