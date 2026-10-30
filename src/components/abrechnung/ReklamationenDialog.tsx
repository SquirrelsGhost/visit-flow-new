// Liste, Auswahl und Export brauchen State und Browser-APIs
"use client";

import { CheckCircle2, Copy, Download, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { useReklamationen } from "../../hooks/useReklamationen";
import { round2 } from "../../lib/abrechnung/abrechnungFormat";
import type { AbrechnungCategory } from "../../lib/abrechnung/abrechnungTypes";
import { claimAmount, downloadText, reklamationenCsv, reklamationenText } from "../../lib/abrechnung/reklamationExport";
import { cn } from "../../lib/cn";
import { eur } from "../../lib/tariff/eur";
import { abrechnungTexts as t } from "../../texts/abrechnungTexts";
import Modal from "../ui/Modal";
import { ICON_BUTTON, OUTLINE_BUTTON, PRIMARY_BUTTON } from "./abrechnungStyles";
import ReklamationRow from "./ReklamationRow";

interface ReklamationenDialogProps {
  open: boolean;
  category: AbrechnungCategory;
  onClose: () => void;
}

/** Reklamationen-Center: alle offenen Reklamationen, als CSV exportieren, kopieren oder erledigen (v1). */
export default function ReklamationenDialog({ open, category, onClose }: ReklamationenDialogProps) {
  const { items, selected, toggle, setSelected, resolving, resolve } = useReklamationen(category, open);
  const list = items ?? [];
  const sum = round2(list.reduce((s, i) => s + claimAmount(i), 0));
  const exportCsv = () => downloadText(reklamationenCsv(list), `Reklamationen_${new Date().toISOString().slice(0, 10)}.csv`);
  const copy = async () => {
    await navigator.clipboard?.writeText(reklamationenText(list));
    toast.success(t.copied);
  };

  return (
    <Modal open={open} onClose={onClose} labelledBy="abr-center-title" className="flex max-h-[85vh] max-w-lg flex-col">
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-5 pb-4 dark:border-white/[0.06]">
        <div>
          <h2 id="abr-center-title" className="text-lg font-semibold text-slate-900 dark:text-white">
            {t.centerTitle}
          </h2>
          <p className="text-sm text-slate-500 dark:text-neutral-400">{`${t.centerSum}: ${eur(sum)}`}</p>
        </div>
        <button type="button" onClick={onClose} className={cn(ICON_BUTTON, "-mt-2 -mr-2")} aria-label={t.close}>
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {items === null ? (
          <div className="grid place-items-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
          </div>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            <p className="text-sm text-slate-500 dark:text-neutral-400">{t.centerEmpty}</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {list.map((item) => (
              <ReklamationRow key={item._id} item={item} selected={selected.includes(item._id)} onToggle={() => toggle(item._id)} />
            ))}
          </ul>
        )}
      </div>
      {list.length > 0 && (
        <div className="flex flex-wrap gap-2 border-t border-slate-100 p-4 dark:border-white/[0.06]">
          <button type="button" onClick={exportCsv} className={cn(OUTLINE_BUTTON, "px-3")}>
            <Download className="h-4 w-4" /> {t.exportCsv}
          </button>
          <button type="button" onClick={copy} className={cn(OUTLINE_BUTTON, "px-3")}>
            <Copy className="h-4 w-4" /> {t.copy}
          </button>
          <button type="button" onClick={() => setSelected(selected.length === list.length ? [] : list.map((i) => i._id))} className={cn(OUTLINE_BUTTON, "px-3")}>
            {selected.length === list.length ? t.selectNone : t.selectAll}
          </button>
          <button type="button" disabled={!selected.length || resolving} onClick={resolve} className={cn(PRIMARY_BUTTON, "ml-auto")}>
            {resolving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {t.resolve(selected.length)}
          </button>
        </div>
      )}
    </Modal>
  );
}
