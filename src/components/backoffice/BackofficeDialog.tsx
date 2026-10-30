// Grund-Eingabe lebt im Browser
"use client";

import { useState } from "react";
import { useLastDefined } from "../../hooks/useLastDefined";
import { cn } from "../../lib/cn";
import type { BackofficeAction } from "../../lib/backoffice/backofficeTypes";
import { formatEuro } from "../../lib/crm/crmFormat";
import type { AdminSale } from "../../lib/crmOverview/overviewTypes";
import { backofficeTexts as t } from "../../texts/backofficeTexts";
import { GLASS_FIELD } from "../glass/glassStyles";
import ConfirmDialog from "../profile/ConfirmDialog";

/** Was entschieden werden soll. */
export interface BackofficeConfirm {
  action: BackofficeAction;
  sales: readonly AdminSale[];
}

interface BackofficeDialogProps {
  confirm: BackofficeConfirm | null;
  busy: boolean;
  onClose: () => void;
  onConfirm: (confirm: BackofficeConfirm, reason?: string) => void;
}

const CHIP = "rounded-full px-3 py-1.5 text-[12.5px] font-semibold ring-1 ring-inset transition-colors duration-200";

const Line = ({ label, value }: { label: string; value: string }) => (
  <p className="flex justify-between gap-3 text-[13px]">
    <span>{label}</span>
    <span className="max-w-[60%] truncate text-right font-medium text-foreground">{value}</span>
  </p>
);

/** Rückfrage vor jeder Entscheidung; beim Stornieren mit Grund (Schnellwahl oder frei), der als Verlustgrund mitgeht. */
export default function BackofficeDialog({ confirm, busy, onClose, onConfirm }: BackofficeDialogProps) {
  const shown = useLastDefined(confirm);
  const [reason, setReason] = useState("");
  const sales = shown?.sales ?? [];
  const action = shown?.action ?? "complete";
  const one = sales.length === 1 ? sales[0] : undefined;
  const copy = t.confirm[action];
  const close = () => {
    setReason("");
    onClose();
  };
  const submit = () => {
    if (!shown) return;
    onConfirm(shown, action === "cancel" ? reason.trim() || undefined : undefined);
    setReason("");
  };
  return (
    <ConfirmDialog open={!!confirm} title={copy.title(sales.length)} confirmLabel={t[action]} cancelLabel={t.back} busy={busy} onClose={close} onConfirm={submit}>
      <p>{copy.body}</p>
      <div className="mt-3 space-y-1">
        {one && <Line label={one.customerName} value={one.type} />}
        {one && <Line label={t.sellerLabel} value={one.userName} />}
        <Line label={t.commission} value={formatEuro(sales.reduce((n, s) => n + s.commissionEuro, 0))} />
      </div>
      {action === "cancel" && (
        <div className="mt-4 space-y-2.5">
          <div className="flex flex-wrap gap-1.5">
            {t.reasons.map((r) => (
              <button key={r} type="button" aria-pressed={reason === r} onClick={() => setReason(reason === r ? "" : r)} className={cn(CHIP, reason === r ? "bg-red-500 text-white ring-red-500" : "text-foreground ring-[var(--glass-divider)] hover:bg-[var(--glass-hover)]")}>
                {r}
              </button>
            ))}
          </div>
          <input value={reason} onChange={(e) => setReason(e.target.value)} maxLength={120} aria-label={t.reasonLabel} placeholder={t.reasonPlaceholder} className={GLASS_FIELD} />
        </div>
      )}
    </ConfirmDialog>
  );
}
