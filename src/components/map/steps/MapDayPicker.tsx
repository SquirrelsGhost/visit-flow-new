// Schnellauswahl rechnet mit dem heutigen Datum im Browser
"use client";

import { cn } from "../../../lib/cn";
import { addDays, addMonths, localDate } from "../../../lib/map/visitSteps";
import { CHIP_ACTIVE, CHIP_BASE, CHIP_IDLE, STEP_INPUT, STEP_LABEL } from "./stepStyles";

interface MapDayPickerProps {
  label: string;
  /** Datum als YYYY-MM-DD. */
  value: string;
  onChange: (value: string) => void;
  color: string;
  /** "days" für Termine (Heute, Morgen …), "months" für "versorgt bis". */
  mode?: "days" | "months";
}

const DAY_CHIPS = [
  { label: "Heute", at: () => new Date() },
  { label: "Morgen", at: () => addDays(new Date(), 1) },
  { label: "Übermorgen", at: () => addDays(new Date(), 2) },
];

const MONTH_CHIPS = [
  { label: "+6 Monate", at: () => addMonths(new Date(), 6) },
  { label: "+12 Monate", at: () => addMonths(new Date(), 12) },
  { label: "+24 Monate", at: () => addMonths(new Date(), 24) },
];

/** Datum per Schnellauswahl oder Kalenderfeld. */
export default function MapDayPicker({ label, value, onChange, color, mode = "days" }: MapDayPickerProps) {
  const chips = (mode === "days" ? DAY_CHIPS : MONTH_CHIPS).map((c) => ({ label: c.label, date: localDate(c.at()) }));

  return (
    <div>
      <span className={STEP_LABEL}>{label}</span>
      <div className="mb-2 grid grid-cols-3 gap-2">
        {chips.map((c) => (
          <button
            key={c.label}
            type="button"
            aria-pressed={value === c.date}
            onClick={() => onChange(c.date)}
            className={cn(CHIP_BASE, value === c.date ? CHIP_ACTIVE : CHIP_IDLE)}
            style={value === c.date ? { background: color } : undefined}
          >
            {c.label}
          </button>
        ))}
      </div>
      <input type="date" aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} className={STEP_INPUT} />
    </div>
  );
}
