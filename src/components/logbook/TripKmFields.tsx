import { Info } from "lucide-react";
import type { TripDraft } from "../../lib/logbook/logbookDraft";
import { formatKm } from "../../lib/logbook/logbookFormat";
import type { LogbookTexts } from "../../texts/logbook/logbookTexts";
import LogbookField from "./LogbookField";

interface TripKmFieldsProps {
  draft: TripDraft;
  errors: Partial<Record<"startKm" | "endKm", string>>;
  /** Kilometerstand am Ende der Fahrt davor; liegt der Start darüber, entsteht eine Lücke. */
  previousEnd?: number;
  t: LogbookTexts;
  onChange: (patch: Partial<TripDraft>) => void;
}

const asKm = (s: string) => (/^\d{1,7}$/.test(s.trim()) ? Number(s.trim()) : NaN);

/** Kilometerstand Start und Ende, dazwischen die Strecke: wer die Strecke tippt, bekommt das Ende ausgerechnet. */
export default function TripKmFields({ draft, errors, previousEnd, t, onChange }: TripKmFieldsProps) {
  const start = asKm(draft.startKm);
  const end = asKm(draft.endKm);
  const distance = !Number.isNaN(start) && !Number.isNaN(end) && end >= start ? String(end - start) : "";
  const gap = previousEnd !== undefined && !Number.isNaN(start) && start > previousEnd ? start - previousEnd : 0;
  const setDistance = (value: string) => {
    const d = asKm(value);
    onChange({ endKm: value === "" ? "" : !Number.isNaN(start) && !Number.isNaN(d) ? String(start + d) : draft.endKm });
  };
  return (
    <div>
      <div className="grid grid-cols-[1fr_0.7fr_1fr] gap-2.5">
        <LogbookField label={t.kmStart} inputMode="numeric" value={draft.startKm} onChange={(startKm) => onChange({ startKm })} error={errors.startKm} onFocus={(e) => e.target.select()} />
        <LogbookField label={t.distance} inputMode="numeric" value={distance} onChange={setDistance} placeholder="km" onFocus={(e) => e.target.select()} />
        <LogbookField label={t.kmEnd} inputMode="numeric" value={draft.endKm} onChange={(endKm) => onChange({ endKm })} error={errors.endKm} onFocus={(e) => e.target.select()} />
      </div>
      {gap > 0 && (
        <p className="mt-2 flex items-start gap-1.5 px-1 text-[12px] leading-snug text-amber-700 dark:text-amber-300">
          <Info aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {t.kmGapWarning(formatKm(gap, t))}
        </p>
      )}
    </div>
  );
}
