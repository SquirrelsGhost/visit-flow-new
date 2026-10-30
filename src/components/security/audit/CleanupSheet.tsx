// Gewählte Frist lebt im Browser
"use client";

import { TriangleAlert } from "lucide-react";
import { useState } from "react";
import { useSecurityTexts } from "../../../hooks/useSecurityTexts";
import GlassFilterChips from "../../glass/GlassFilterChips";
import GlassSheet from "../../glass/GlassSheet";
import SheetButton from "../../licenses/sheets/SheetButton";
import SheetNote from "../../licenses/sheets/SheetNote";

interface CleanupSheetProps {
  open: boolean;
  onClose: () => void;
  onCleanup: (days: number) => Promise<boolean>;
}

/** Fristen zur Auswahl; v1 hatte ein freies Zahlenfeld mit 30 als Vorgabe. */
const DAYS = ["30", "60", "90", "180"] as const;
type Days = (typeof DAYS)[number];

/** Alte Protokolleinträge löschen (v1 DELETE /security/audit-log/cleanup?daysOld=). */
export default function CleanupSheet({ open, onClose, onCleanup }: CleanupSheetProps) {
  const t = useSecurityTexts();
  const [days, setDays] = useState<Days>("90");
  const [busy, setBusy] = useState(false);
  const run = async () => {
    setBusy(true);
    const ok = await onCleanup(Number(days));
    setBusy(false);
    if (ok) onClose();
  };
  return (
    <GlassSheet open={open} onClose={onClose} title={t.audit.cleanupTitle} subtitle={t.audit.cleanupText}>
      <GlassFilterChips label={t.audit.cleanupText} layoutId="security-cleanup-days" active={days} onChange={setDays} options={DAYS.map((id) => ({ id, label: t.audit.cleanupDays(Number(id)) }))} />
      <SheetNote icon={TriangleAlert} tone="warn">
        {t.audit.cleanupWarn}
      </SheetNote>
      <SheetButton label={t.audit.cleanupConfirm(Number(days))} busyLabel={t.busy} busy={busy} variant="danger" onClick={() => void run()} />
      <SheetButton label={t.cancel} variant="secondary" onClick={onClose} />
    </GlassSheet>
  );
}
