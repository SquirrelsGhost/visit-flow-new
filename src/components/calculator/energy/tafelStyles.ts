import type { TafelArt } from "../../../lib/energy/energyTafel";

/** Akzentfarbe je Tafel auf dunklem Grund (v1 AKZENT). */
export const AKZENT: Record<TafelArt, string> = {
  strom: "text-amber-300",
  gas: "text-orange-300",
  zusammen: "text-amber-200",
};

export const TAFEL_EASE = [0.22, 1, 0.36, 1] as const;
