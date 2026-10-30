// Wählt nach dem aktiven Bereich (liest localStorage) und rendert erst im Browser
"use client";

import { useIsClient } from "../../hooks/useIsClient";
import { useVertical } from "../../hooks/useVertical";
import EnergyPencilSell from "./energy/EnergyPencilSell";
import PencilSellSkeleton from "./PencilSellSkeleton";
import SolarPencilSell from "./solar/SolarPencilSell";
import TelcoPencilSell from "./telco/TelcoPencilSell";

/**
 * Tarif-Vergleich für den aktiven Bereich (v1 PencilSellMode): Telco, Solar oder Energie.
 * Jeder Bereich ist eine eigene Komponente, damit ein Wechsel nie die Hook-Reihenfolge stört.
 */
export interface PencilSellModeProps { readonly _?: never; }

export default function PencilSellMode() {
  const isClient = useIsClient();
  const vertical = useVertical();
  if (!isClient) return <PencilSellSkeleton />;
  if (vertical === "solar") return <SolarPencilSell />;
  if (vertical === "energy") return <EnergyPencilSell />;
  return <TelcoPencilSell />;
}
