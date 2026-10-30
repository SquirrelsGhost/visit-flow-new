// Grund für das Wiederöffnen lebt im Browser
"use client";

import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { formatDateTime } from "../../lib/logbook/logbookFormat";
import type { MonthLock } from "../../lib/logbook/logbookTypes";
import type { LogbookTexts } from "../../texts/logbook/logbookTexts";
import GlassSheet from "../glass/GlassSheet";
import { GLASS_BUTTON } from "../glass/glassStyles";
import LogbookField from "./LogbookField";

interface LockSheetProps {
  open: boolean;
  locked: boolean;
  lock?: MonthLock;
  monthLabel: string;
  /** Fehler im Finanzamt-Check, die das Abschließen verhindern. */
  blocking: number;
  t: LogbookTexts;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

/** Monat abschließen (Fahrten werden unveränderbar) oder mit Grund wieder öffnen; beides bleibt im Protokoll. */
export default function LockSheet({ open, locked, lock, monthLabel, blocking, t, onClose, onConfirm }: LockSheetProps) {
  const [reason, setReason] = useState("");
  const history = [
    ...(lock?.lockedAt ? [t.lockedSince(formatDateTime(lock.lockedAt, t))] : []),
    ...(lock?.reopened ?? []).map((r) => t.reopenedLine(formatDateTime(r.at, t), r.reason)),
  ];
  const disabled = locked ? reason.trim().length < 3 : blocking > 0;
  return (
    <GlassSheet open={open} onClose={onClose} title={locked ? t.unlockTitle : t.lockTitle} subtitle={monthLabel}>
      <p className="text-[14px] leading-relaxed text-muted-foreground">{locked ? t.unlockText : t.lockText(monthLabel)}</p>
      {locked && <LogbookField label={t.unlockReason} value={reason} onChange={setReason} placeholder={t.unlockPlaceholder} />}
      {!locked && blocking > 0 && (
        <p className="flex items-start gap-1.5 text-[13px] font-medium text-red-600 dark:text-red-400">
          <AlertTriangle aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
          {t.lockBlocked(blocking)}
        </p>
      )}
      {history.length > 0 && (
        <ul className="space-y-0.5 px-1 text-[12.5px] text-muted-foreground">
          {history.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          onConfirm(reason.trim());
          setReason("");
        }}
        className={GLASS_BUTTON}
      >
        {locked ? t.unlockConfirm : t.lockConfirm}
      </button>
    </GlassSheet>
  );
}
