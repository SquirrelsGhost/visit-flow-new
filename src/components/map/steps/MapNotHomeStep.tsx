// Braucht useState für Option, Zeitpunkt, Kommentar und Kundentyp
"use client";

import { useState } from "react";
import { cn } from "../../../lib/cn";
import type { Vertical } from "../../../lib/battle/battleCategories";
import { colorForStatus, type VisitDetails } from "../../../lib/map/mapTypes";
import { customerTypes, defaultRetryAt, visitComment } from "../../../lib/map/visitSteps";
import MapStatusIcon from "../MapStatusIcon";
import MapChoiceGrid from "./MapChoiceGrid";
import MapRetryPicker from "./MapRetryPicker";
import MapStepFrame from "./MapStepFrame";
import { CHIP_ACTIVE, CHIP_BASE, CHIP_IDLE, STEP_INPUT, STEP_LABEL } from "./stepStyles";

interface MapNotHomeStepProps {
  vertical: Vertical;
  saving: boolean;
  onBack: () => void;
  onSave: (details: VisitDetails) => void;
}

const STATUS = "N/A" as const;
const OPTIONS = [
  { id: "simple", label: "✓ Einfach speichern" },
  { id: "retry", label: "⏰ Später nochmal" },
] as const;

/** v1 NotHomeDialog: einfach speichern oder Zeitpunkt für den nächsten Versuch, dazu Kommentar und Kundentyp. */
export default function MapNotHomeStep({ vertical, saving, onBack, onSave }: MapNotHomeStepProps) {
  const [option, setOption] = useState<"simple" | "retry">("simple");
  const [retryAt, setRetryAt] = useState("");
  const [comment, setComment] = useState("");
  const [customerType, setCustomerType] = useState<string>();
  const color = colorForStatus(STATUS);

  const save = () =>
    onSave({
      customerType,
      comment: visitComment({ retryAt: option === "retry" ? retryAt : undefined, comment: comment.trim() }),
    });

  return (
    <MapStepFrame
      title="Nicht angetroffen"
      color={color}
      icon={<MapStatusIcon status={STATUS} vertical={vertical} size={18} />}
      saving={saving}
      canSave={option === "simple" || Boolean(retryAt)}
      onBack={onBack}
      onSave={save}
    >
      <div className="grid grid-cols-2 gap-2">
        {OPTIONS.map((o) => (
          <button
            key={o.id}
            type="button"
            aria-pressed={option === o.id}
            onClick={() => {
              setOption(o.id);
              if (o.id === "retry" && !retryAt) setRetryAt(defaultRetryAt());
            }}
            className={cn(CHIP_BASE, "py-3 text-sm", option === o.id ? CHIP_ACTIVE : CHIP_IDLE)}
            style={option === o.id ? { background: color } : undefined}
          >
            {o.label}
          </button>
        ))}
      </div>
      {option === "retry" && <MapRetryPicker value={retryAt} onChange={setRetryAt} color={color} />}
      <div>
        <span className={STEP_LABEL}>Kommentar</span>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={2}
          placeholder={
            vertical === "solar"
              ? "z. B. 'Eigentümer nicht da' oder 'Nur abends erreichbar'"
              : "z. B. 'Vertragsinhaber nicht da' oder 'Nur abends erreichbar'"
          }
          className={STEP_INPUT}
        />
      </div>
      <div>
        <span className={STEP_LABEL}>Kundentyp</span>
        <MapChoiceGrid
          choices={customerTypes(vertical)}
          value={customerType}
          onChange={setCustomerType}
          color={color}
          columns={3}
          toggle
        />
      </div>
    </MapStepFrame>
  );
}
