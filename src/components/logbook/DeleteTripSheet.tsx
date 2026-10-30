import { useLastDefined } from "../../hooks/useLastDefined";
import { cn } from "../../lib/cn";
import { formatDate, formatKm } from "../../lib/logbook/logbookFormat";
import { tripKm } from "../../lib/logbook/logbookLogic";
import type { Trip } from "../../lib/logbook/logbookTypes";
import type { LogbookTexts } from "../../texts/logbook/logbookTexts";
import GlassSheet from "../glass/GlassSheet";
import { GLASS_INSET } from "../glass/glassStyles";
import { SOFT_BUTTON, SOFT_NEUTRAL } from "./logbookStyles";

interface DeleteTripSheetProps {
  trip: Trip | null;
  t: LogbookTexts;
  onClose: () => void;
  onConfirm: (trip: Trip) => void;
}

/** Rückfrage vor dem Löschen einer Fahrt; weist auf die entstehende Kilometer-Lücke hin. */
export default function DeleteTripSheet({ trip, t, onClose, onConfirm }: DeleteTripSheetProps) {
  const shown = useLastDefined(trip);
  return (
    <GlassSheet open={trip !== null} onClose={onClose} title={t.deleteTitle}>
      {shown && (
        <>
          <div className={cn(GLASS_INSET, "px-3.5 py-3 text-[13px]")}>
            <p className="font-semibold text-foreground">{[shown.from, shown.to].filter(Boolean).join(" → ") || t.noPlace}</p>
            <p className="mt-0.5 text-muted-foreground">{`${formatDate(shown.date, t)} · ${t.kindsLong[shown.kind]} · ${formatKm(tripKm(shown), t)}`}</p>
          </div>
          <p className="text-[14px] leading-relaxed text-muted-foreground">{t.deleteText}</p>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className={cn(SOFT_BUTTON, SOFT_NEUTRAL, "h-12 flex-1")}>
              {t.cancel}
            </button>
            <button type="button" onClick={() => onConfirm(shown)} className={cn(SOFT_BUTTON, "h-12 flex-1 bg-red-500 text-white hover:bg-red-600")}>
              {t.deleteConfirm}
            </button>
          </div>
        </>
      )}
    </GlassSheet>
  );
}
