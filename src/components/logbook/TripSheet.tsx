// Formularzustand lebt im Browser
"use client";

import { useMemo, useState } from "react";
import { createTrip, reviseTrip, toFields, validateDraft, type TripDraft } from "../../lib/logbook/logbookDraft";
import { isTripLocked } from "../../lib/logbook/logbookChecks";
import { frequent, previousTrip } from "../../lib/logbook/logbookLogic";
import type { LogbookData, Trip } from "../../lib/logbook/logbookTypes";
import { suggestionFor } from "../../lib/logbook/logbookVisits";
import type { LogbookTexts } from "../../texts/logbook/logbookTexts";
import GlassSheet from "../glass/GlassSheet";
import { GLASS_BUTTON } from "../glass/glassStyles";
import LogbookField from "./LogbookField";
import TripKindSwitch from "./TripKindSwitch";
import TripKmFields from "./TripKmFields";
import TripPlaceFields from "./TripPlaceFields";

interface TripSheetProps {
  open: boolean;
  /** Bearbeitete Fahrt; fehlt bei einer neuen Fahrt. */
  editing?: Trip;
  initial: TripDraft;
  data: LogbookData;
  driver: string;
  t: LogbookTexts;
  onClose: () => void;
  onSave: (trip: Trip) => void;
}

/**
 * Fahrt erfassen oder ändern (v1: automatisch aus der Tagesroute). Art, Datum und Uhrzeit, Kilometerstand mit Strecke,
 * Ziel, Zweck und Partner. Fehler erscheinen erst nach dem ersten Speichern, danach live.
 */
export default function TripSheet({ open, editing, initial, data, driver, t, onClose, onSave }: TripSheetProps) {
  const [draft, setDraft] = useState(initial);
  const [tried, setTried] = useState(false);
  const change = (patch: Partial<TripDraft>) => setDraft((d) => ({ ...d, ...patch }));

  const others = useMemo(() => data.trips.filter((x) => x.id !== editing?.id), [data.trips, editing]);
  const previous = previousTrip(others, draft.vehicleId, draft.date, draft.startTime || "00:00");
  const suggestion = useMemo(() => (draft.date ? suggestionFor(draft.date) : null), [draft.date]);
  const errors = validateDraft(draft);
  if (draft.date && isTripLocked(data, draft)) errors.date = "locked";
  const shown = tried ? Object.fromEntries(Object.entries(errors).map(([k, v]) => [k, t.errors[v]])) : {};

  const submit = () => {
    setTried(true);
    if (Object.keys(errors).length > 0) return;
    const fields = toFields(draft);
    onSave(editing ? reviseTrip(editing, fields) : createTrip(fields, driver));
  };

  return (
    <GlassSheet open={open} onClose={onClose} title={editing ? t.sheetEdit : t.sheetNew} subtitle={editing ? t.sheetEditHint : t.sheetNewHint}>
      <TripKindSwitch value={draft.kind} t={t} onChange={(kind) => change({ kind })} />
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-[1.4fr_1fr_1fr]">
        <LogbookField className="col-span-2 sm:col-span-1" label={t.field.date} type="date" value={draft.date} onChange={(date) => change({ date })} error={shown.date} />
        <LogbookField label={t.field.startTime} type="time" value={draft.startTime} onChange={(startTime) => change({ startTime })} />
        <LogbookField label={t.field.endTime} type="time" value={draft.endTime} onChange={(endTime) => change({ endTime })} error={shown.endTime} />
      </div>
      <TripKmFields draft={draft} errors={shown} previousEnd={previous?.endKm} t={t} onChange={change} />
      <TripPlaceFields draft={draft} errors={shown} frequentTo={frequent(others, "to", 5)} frequentPurposes={frequent(others, "purpose", 4)} suggestion={suggestion} t={t} onChange={change} />
      {data.vehicles.length > 1 && (
        <label className="block">
          <span className="sr-only">{t.field.vehicleId}</span>
          <select value={draft.vehicleId} onChange={(e) => change({ vehicleId: e.target.value })} className="h-11 w-full rounded-2xl border border-[var(--glass-divider)] bg-white/60 px-3 text-sm text-foreground dark:bg-white/[0.04]">
            {data.vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {[v.name || t.vehicleUnnamed, v.plate].filter(Boolean).join(" · ")}
              </option>
            ))}
          </select>
        </label>
      )}
      <button type="button" onClick={submit} className={GLASS_BUTTON}>
        {editing ? t.saveEdit : t.save}
      </button>
    </GlassSheet>
  );
}
