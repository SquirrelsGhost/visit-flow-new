// Braucht useState für Grund, Notiz und "später nochmal"
"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import type { Vertical } from "../../../lib/battle/battleCategories";
import { colorForStatus, type VisitDetails } from "../../../lib/map/mapTypes";
import { noInterestReasons, visitComment } from "../../../lib/map/visitSteps";
import MapStatusIcon from "../MapStatusIcon";
import MapChoiceGrid from "./MapChoiceGrid";
import MapStepFrame from "./MapStepFrame";
import { STEP_INPUT, STEP_LABEL } from "./stepStyles";

interface MapNoInterestStepProps {
  vertical: Vertical;
  saving: boolean;
  onBack: () => void;
  onSave: (details: VisitDetails) => void;
}

const STATUS = "Angetroffen → Kein Interesse" as const;

/** v1 NoInterestDialog: Grund, Notiz und "später nochmal versuchen". */
export default function MapNoInterestStep({ vertical, saving, onBack, onSave }: MapNoInterestStepProps) {
  const [reason, setReason] = useState<string>();
  const [note, setNote] = useState("");
  const [retryLater, setRetryLater] = useState(false);
  const color = colorForStatus(STATUS);
  const reasons = noInterestReasons(vertical);

  const save = () => {
    const label = reasons.find((r) => r.id === reason)?.label;
    const comment = [note.trim(), retryLater && "Später nochmal versuchen"].filter(Boolean).join(" · ");
    onSave({ comment: visitComment({ reason: label, comment }) });
  };

  return (
    <MapStepFrame
      title="Kein Interesse"
      color={color}
      icon={<MapStatusIcon status={STATUS} vertical={vertical} size={18} />}
      saving={saving}
      onBack={onBack}
      onSave={save}
    >
      <div>
        <span className={STEP_LABEL}>Grund</span>
        <MapChoiceGrid choices={reasons} value={reason} onChange={setReason} color={color} />
      </div>
      <div>
        <span className={STEP_LABEL}>Notiz (optional)</span>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder={
            vertical === "solar"
              ? "z. B. 'Dach gemietet / zu schattig' (keine vollen Kundennamen)"
              : "z. B. 'Hat Vertrag bei Telekom' (keine vollen Kundennamen)"
          }
          className={STEP_INPUT}
        />
      </div>
      <button
        type="button"
        aria-pressed={retryLater}
        onClick={() => setRetryLater((v) => !v)}
        className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-slate-100 px-3 py-3 text-left text-sm font-semibold text-slate-800 transition active:scale-[0.99] dark:border-white/10 dark:bg-[#121a2b] dark:text-white"
      >
        <span
          className="grid h-5 w-5 place-items-center rounded-md border-2 transition-colors"
          style={retryLater ? { background: color, borderColor: color } : undefined}
        >
          {retryLater && <Check size={13} className="text-white" />}
        </span>
        ⏰ Später nochmal versuchen
      </button>
    </MapStepFrame>
  );
}
