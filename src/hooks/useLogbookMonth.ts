import { useMemo } from "react";
import { checkMonth, isBlocking, isLocked } from "../lib/logbook/logbookChecks";
import { monthId } from "../lib/logbook/logbookDates";
import { dailyBars, summarize, tripsInMonth, tripsInYear } from "../lib/logbook/logbookLogic";
import type { LogbookData, MonthRef } from "../lib/logbook/logbookTypes";

/** Alles, was die Seite zu einem Monat zeigt: Fahrten, Kennzahlen, Balken, Finanzamt-Check und Abschluss. */
export function useLogbookMonth(data: LogbookData, ref: MonthRef) {
  return useMemo(() => {
    const trips = tripsInMonth(data.trips, ref);
    const issues = checkMonth(data, ref);
    const yearTrips = tripsInYear(data.trips, ref.year).filter((x) => x.date <= `${monthId(ref)}-31`);
    return {
      id: monthId(ref),
      trips,
      summary: summarize(trips),
      bars: dailyBars(trips, ref),
      issues,
      blocking: issues.filter(isBlocking).length,
      locked: isLocked(data, ref),
      lock: data.locks[monthId(ref)],
      yearToDate: summarize(yearTrips),
    };
  }, [data, ref]);
}
