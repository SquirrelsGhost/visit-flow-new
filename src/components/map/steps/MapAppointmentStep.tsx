// Braucht useState für Datum, Uhrzeit, Terminart und Notiz
"use client";

import { useState } from "react";
import type { Vertical } from "../../../lib/battle/battleCategories";
import { cn } from "../../../lib/cn";
import { colorForStatus, type VisitDetails } from "../../../lib/map/mapTypes";
import { appointmentTypes, TIME_SLOTS, visitComment } from "../../../lib/map/visitSteps";
import MapStatusIcon from "../MapStatusIcon";
import MapChoiceGrid from "./MapChoiceGrid";
import MapDayPicker from "./MapDayPicker";
import MapStepFrame from "./MapStepFrame";
import { CHIP_ACTIVE, CHIP_BASE, CHIP_IDLE, STEP_INPUT, STEP_LABEL } from "./stepStyles";

interface MapAppointmentStepProps {
  vertical: Vertical;
  saving: boolean;
  onBack: () => void;
  onSave: (details: VisitDetails) => void;
}

const STATUS = "Angetroffen → Termin" as const;

/** v1 AppointmentDialogStepByStep (Termin): Tag, Uhrzeit, Terminart und Notiz auf einer Seite statt in vier Schritten. */
export default function MapAppointmentStep({ vertical, saving, onBack, onSave }: MapAppointmentStepProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [type, setType] = useState<string>();
  const [note, setNote] = useState("");
  const color = colorForStatus(STATUS);

  const save = () =>
    onSave({
      appointmentDate: date,
      appointmentTime: time,
      appointmentType: type,
      comment: visitComment({ appointmentType: type, comment: note.trim() }),
    });

  return (
    <MapStepFrame
      title="Termin vereinbaren"
      color={color}
      icon={<MapStatusIcon status={STATUS} vertical={vertical} size={18} />}
      saving={saving}
      canSave={Boolean(date && time)}
      saveLabel="Termin speichern"
      onBack={onBack}
      onSave={save}
    >
      <MapDayPicker label="Wann?" value={date} onChange={setDate} color={color} />
      <div>
        <span className={STEP_LABEL}>Uhrzeit</span>
        <div className="grid grid-cols-4 gap-1.5">
          {TIME_SLOTS.map((slot) => (
            <button
              key={slot}
              type="button"
              aria-pressed={time === slot}
              onClick={() => setTime(slot)}
              className={cn(CHIP_BASE, "px-0 tabular-nums", time === slot ? CHIP_ACTIVE : CHIP_IDLE)}
              style={time === slot ? { background: color } : undefined}
            >
              {slot}
            </button>
          ))}
        </div>
        <input
          type="time"
          aria-label="Andere Uhrzeit"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className={cn(STEP_INPUT, "mt-2")}
        />
      </div>
      <div>
        <span className={STEP_LABEL}>Art des Termins</span>
        <MapChoiceGrid choices={appointmentTypes(vertical)} value={type} onChange={setType} color={color} />
      </div>
      <div>
        <span className={STEP_LABEL}>Notiz (optional)</span>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} className={STEP_INPUT} />
      </div>
    </MapStepFrame>
  );
}
