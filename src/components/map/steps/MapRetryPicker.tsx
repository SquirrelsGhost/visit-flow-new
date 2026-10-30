// Schnellauswahl rechnet mit der aktuellen Uhrzeit im Browser
"use client";

import { addDays, localDate, localTime } from "../../../lib/map/visitSteps";
import { CHIP_BASE, CHIP_IDLE, STEP_INPUT, STEP_LABEL } from "./stepStyles";

interface MapRetryPickerProps {
  /** Zeitpunkt als "YYYY-MM-DDTHH:MM" (v1 datetime-local). */
  value: string;
  onChange: (value: string) => void;
  color: string;
}

function tomorrowAtTen(): Date {
  const d = addDays(new Date(), 1);
  d.setHours(10, 0, 0, 0);
  return d;
}

const QUICK = [
  { label: "+2 Std", at: () => new Date(Date.now() + 2 * 3_600_000) },
  { label: "+4 Std", at: () => new Date(Date.now() + 4 * 3_600_000) },
  { label: "Morgen 10:00", at: tomorrowAtTen },
] as const;


/** Wann nochmal klingeln: Schnellauswahl wie v1 plus freies Datum/Uhrzeit. */
export default function MapRetryPicker({ value, onChange, color }: MapRetryPickerProps) {
  const pick = (d: Date) => onChange(`${localDate(d)}T${localTime(d)}`);

  return (
    <div className="rounded-2xl border p-3" style={{ borderColor: `${color}55`, background: `${color}12` }}>
      <span className={STEP_LABEL}>Wann nochmal versuchen?</span>
      <div className="mb-2 grid grid-cols-3 gap-2">
        {QUICK.map((q) => (
          <button key={q.label} type="button" onClick={() => pick(q.at())} className={`${CHIP_BASE} ${CHIP_IDLE}`}>
            {q.label}
          </button>
        ))}
      </div>
      <input
        type="datetime-local"
        aria-label="Zeitpunkt"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={STEP_INPUT}
      />
    </div>
  );
}
