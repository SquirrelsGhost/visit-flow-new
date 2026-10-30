// Grund und Notiz sind Formular-State
"use client";

import { useState } from "react";
import { itemSubtitle, itemTitle } from "../../lib/abrechnung/abrechnungFormat";
import { REKLAMATION_REASONS, suggestedReason } from "../../lib/abrechnung/abrechnungStatus";
import type { AbrechnungItem } from "../../lib/abrechnung/abrechnungTypes";
import { cn } from "../../lib/cn";
import { abrechnungTexts as t } from "../../texts/abrechnungTexts";
import { chip, FIELD, OUTLINE_BUTTON, PRIMARY_BUTTON } from "./abrechnungStyles";

interface ClaimFormProps {
  items: AbrechnungItem[];
  onClose: () => void;
  onSubmit: (items: AbrechnungItem[], reason: string, note: string) => void;
}

/** Inhalt des Reklamations-Dialogs; startet je Auswahl neu (key), damit der vorgeschlagene Grund passt. */
export default function ClaimForm({ items, onClose, onSubmit }: ClaimFormProps) {
  const [reason, setReason] = useState(() => suggestedReason(items));
  const [note, setNote] = useState("");
  const one = items.length === 1 ? items[0] : undefined;
  return (
    <div className="p-5">
      <h2 id="abr-claim-title" className="text-lg font-semibold text-slate-900 dark:text-white">
        {t.claimTitle(items.length)}
      </h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-neutral-400">{one ? [itemTitle(one), itemSubtitle(one)].filter(Boolean).join(" · ") : t.claimSameReason}</p>
      <fieldset className="mt-4">
        <legend className="text-sm font-medium text-slate-800 dark:text-neutral-100">{t.reason}</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {REKLAMATION_REASONS.map((r) => (
            <button key={r} type="button" aria-pressed={reason === r} onClick={() => setReason(r)} className={cn("rounded-full border px-3.5 py-1.5 text-sm transition-colors", chip(reason === r))}>
              {r}
            </button>
          ))}
        </div>
      </fieldset>
      <label htmlFor="abr-claim-note" className="mt-4 block text-sm font-medium text-slate-800 dark:text-neutral-100">
        {t.note} <span className="font-normal text-slate-400">{t.optional}</span>
      </label>
      <input id="abr-claim-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder={t.notePlaceholder} className={cn(FIELD, "mt-1.5")} />
      <div className="mt-5 flex gap-2">
        <button type="button" onClick={onClose} className={cn(OUTLINE_BUTTON, "flex-1")}>
          {t.cancel}
        </button>
        <button type="button" disabled={!reason} onClick={() => onSubmit(items, reason, note)} className={cn(PRIMARY_BUTTON, "flex-1")}>
          {t.claim}
        </button>
      </div>
    </div>
  );
}
