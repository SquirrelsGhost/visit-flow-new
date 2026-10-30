// Braucht useState für das Datum "versorgt bis"
"use client";

import { useState } from "react";
import type { Vertical } from "../../../lib/battle/battleCategories";
import { colorForStatus, type VisitDetails } from "../../../lib/map/mapTypes";
import { visitComment } from "../../../lib/map/visitSteps";
import MapStatusIcon from "../MapStatusIcon";
import MapDayPicker from "./MapDayPicker";
import MapStepFrame from "./MapStepFrame";

interface MapSuppliedStepProps {
  vertical: Vertical;
  saving: boolean;
  onBack: () => void;
  onSave: (details: VisitDetails) => void;
}

const STATUS = "Angetroffen → Versorgt" as const;

/** v1 "Versorgt bis" (AppointmentDialogStepByStep ohne Uhrzeit): Bis wann ist der Kunde versorgt? */
export default function MapSuppliedStep({ vertical, saving, onBack, onSave }: MapSuppliedStepProps) {
  const [date, setDate] = useState("");
  const color = colorForStatus(STATUS);

  return (
    <MapStepFrame
      title="Versorgt bis"
      color={color}
      icon={<MapStatusIcon status={STATUS} vertical={vertical} size={18} />}
      saving={saving}
      canSave={Boolean(date)}
      onBack={onBack}
      onSave={() => onSave({ suppliedUntilDate: date, comment: visitComment({ suppliedUntilDate: date }) })}
    >
      <MapDayPicker label="Bis wann ist der Kunde versorgt?" value={date} onChange={setDate} color={color} mode="months" />
    </MapStepFrame>
  );
}
