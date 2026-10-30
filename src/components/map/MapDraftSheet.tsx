// Braucht useState für Notiz und den aktuellen Status-Schritt
"use client";

import { Loader2, MessageSquarePlus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLastDefined } from "../../hooks/useLastDefined";
import type { Vertical } from "../../lib/battle/battleCategories";
import type { DraftHouse, VisitDetails, VisitStatus } from "../../lib/map/mapTypes";
import type { SaleResult } from "../../lib/map/saleProducts";
import { draftAddressError, stepForStatus, type VisitStep } from "../../lib/map/visitSteps";
import FadeSwap from "../ui/FadeSwap";
import MapDraftAddressFields from "./MapDraftAddressFields";
import MapDraftStatusGrid from "./MapDraftStatusGrid";
import MapDraftStep from "./MapDraftStep";
import MapSheet from "./MapSheet";
import MapSaleLeadStep from "./sale/MapSaleLeadStep";
import MapSaleStep from "./sale/MapSaleStep";
import { STEP_INPUT } from "./steps/stepStyles";

interface MapDraftSheetProps {
  draft: DraftHouse | null;
  creating: boolean;
  saving: boolean;
  vertical: Vertical;
  onChangeDraft: (next: DraftHouse) => void;
  onClose: () => void;
  onApplyStatus: (status: VisitStatus, comment: string, details?: VisitDetails, sale?: SaleResult) => void;
}

const draftKey = (d: DraftHouse) => `${d.lng},${d.lat}`;

/**
 * Bottom-Sheet zum Anlegen eines neuen Hauses per Tap auf die Karte (v1 TrackingMap).
 * Abschluss, Termin, Versorgt, Kein Interesse und Nicht angetroffen führen wie in v1 erst durch ihre Abfrage.
 */
export default function MapDraftSheet({
  draft: currentDraft,
  creating,
  saving,
  vertical,
  onChangeDraft,
  onClose,
  onApplyStatus,
}: MapDraftSheetProps) {
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState("");
  const [stepState, setStepState] = useState<{ key: string; step: VisitStep; status: VisitStatus } | null>(null);
  const draft = useLastDefined(currentDraft);
  if (!draft) return null;

  // Ein neuer Marker beginnt immer bei den Status-Kacheln
  const active = stepState?.key === draftKey(draft) ? stepState : null;

  const handleStatus = (status: VisitStatus) => {
    const step = stepForStatus(status, vertical);
    if (!step) {
      onApplyStatus(status, note);
      return;
    }
    const error = draftAddressError(draft);
    if (error) {
      toast.error(error);
      return;
    }
    setStepState({ key: draftKey(draft), step, status });
  };

  const handleStepSave = (details: VisitDetails, sale?: SaleResult) => {
    if (!active) return;
    const comment = [details.comment, note.trim()].filter(Boolean).join(" | ");
    onApplyStatus(active.status, comment, { ...details, comment }, sale);
  };
  const stepProps = { saving, onBack: () => setStepState(null), onSave: handleStepSave };

  return (
    <MapSheet open={Boolean(currentDraft)} onClose={onClose}>
      <div className="min-h-0 flex-1 overflow-y-auto pb-4 pr-1">
        {active?.step === "sale" ? (
          vertical === "solar" ? (
            <MapSaleLeadStep {...stepProps} />
          ) : (
            <MapSaleStep vertical={vertical} {...stepProps} />
          )
        ) : active ? (
          <MapDraftStep key={active.step} step={active.step} vertical={vertical} {...stepProps} />
        ) : (
          <FadeSwap key="status">
            <div className="mb-3 flex items-center gap-2">
              <div className="text-lg font-extrabold text-slate-900 dark:text-white">Neues Haus</div>
              <span className="rounded-md bg-red-500/20 px-2 py-1 text-[10px] font-bold text-red-500 dark:text-red-300">
                Marker gesetzt
              </span>
              <button type="button" aria-label="Schließen" onClick={onClose} className="ml-auto p-1 text-slate-500 dark:text-white/50">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-2.5">
              <MapDraftStatusGrid vertical={vertical} disabled={saving} onStatus={handleStatus} />
              {creating && (
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-white/60">
                  <Loader2 size={14} className="animate-spin" /> Adresse wird ermittelt…
                </div>
              )}
              <MapDraftAddressFields draft={draft} vertical={vertical} onChangeDraft={onChangeDraft} />
              <button
                type="button"
                onClick={() => setShowNote((v) => !v)}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 bg-slate-50 py-2 text-xs font-semibold text-slate-600 dark:border-white/15 dark:bg-white/5 dark:text-white/70"
              >
                <MessageSquarePlus size={15} /> Notiz
              </button>
              {showNote && (
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  placeholder="Notiz fürs Team (optional)…"
                  className={STEP_INPUT}
                />
              )}
            </div>
          </FadeSwap>
        )}
      </div>
    </MapSheet>
  );
}
