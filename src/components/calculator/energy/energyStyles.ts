import type { Sparte } from "../../../lib/energy/energyCalc";
import { CALC_CARD, CALC_CHECK_ON, CALC_LABEL } from "../calcGlass";

/** Farben je Sparte aus v1 (Strom bernstein, Gas orange), nur noch als leiser Akzent im Glas-Design. */
export const FARBE: Record<Sparte, { aktiv: string; text: string; chip: string }> = {
  strom: {
    aktiv: CALC_CHECK_ON,
    text: "text-amber-600 dark:text-amber-400",
    chip: "bg-amber-500/[0.08] ring-1 ring-inset ring-amber-500/40 dark:bg-amber-400/10",
  },
  gas: {
    aktiv: CALC_CHECK_ON,
    text: "text-orange-600 dark:text-orange-400",
    chip: "bg-orange-500/[0.08] ring-1 ring-inset ring-orange-500/40 dark:bg-orange-400/10",
  },
};

export const PANEL = `${CALC_CARD} space-y-4`;
export const LABEL = CALC_LABEL;
