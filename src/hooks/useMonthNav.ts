import { useCallback, useState } from "react";
import { monthKey, shiftMonth } from "../lib/abrechnung/abrechnungFormat";
import type { MonthRef } from "../lib/abrechnung/abrechnungTypes";

const today = (): MonthRef => {
  const now = new Date();
  return { month: now.getMonth(), year: now.getFullYear() };
};

/** Monatswahl der Abrechnung: nicht über den laufenden Monat hinaus; dir sagt der Animation, woher der neue Monat kommt. */
export function useMonthNav() {
  const [state, setState] = useState(() => ({ ref: today(), dir: 0 }));
  const latest = monthKey(today());
  const atLatest = monthKey(state.ref) >= latest;

  const goTo = useCallback(
    (next: MonthRef) =>
      setState((s) => {
        const key = Math.min(monthKey(next), latest);
        const ref = shiftMonth({ month: 0, year: 0 }, key);
        return { ref, dir: Math.sign(key - monthKey(s.ref)) };
      }),
    [latest],
  );

  const prev = useCallback(() => goTo(shiftMonth(state.ref, -1)), [goTo, state.ref]);
  const next = useCallback(() => goTo(shiftMonth(state.ref, 1)), [goTo, state.ref]);

  return { ref: state.ref, dir: state.dir, atLatest, prev, next, goTo };
}
