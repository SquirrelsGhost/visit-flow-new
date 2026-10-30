// Rechnung, Speicher und Tafel brauchen den Browser
"use client";

import { useInView } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { useEnergyActions } from "../../../hooks/useEnergyActions";
import { useEnergyPencilSell } from "../../../hooks/useEnergyPencilSell";
import EnergyInfoBar from "./EnergyInfoBar";
import EnergyTafel from "./EnergyTafel";
import NewTariffPanel from "./NewTariffPanel";
import ResultCard from "./ResultCard";
import SparteTabs from "./SparteTabs";
import StickySavings from "./StickySavings";
import TodayPanel from "./TodayPanel";

/**
 * Strom- und Gasvergleich (Grundlage v1 EnergyPencilSell) in drei Schritten: heute, neuer Tarif, Ergebnis.
 * Die Ersparnis steht groß im Ergebnis und klebt als Leiste unten, solange man oben noch tippt.
 */
export interface EnergyPencilSellProps { readonly _?: never; }

export default function EnergyPencilSell() {
  const sell = useEnergyPencilSell();
  const { state, aktiv, teile, gesamt, actions } = sell;
  const { abschluss, teilen } = useEnergyActions(state, teile);
  const [tafelOffen, setTafelOffen] = useState(false);
  const schliessen = useCallback(() => setTafelOffen(false), []);
  const ergebnisRef = useRef<HTMLElement>(null);
  const ergebnisSichtbar = useInView(ergebnisRef, { amount: 0.25 });

  const neuStarten = () => {
    actions.neuStarten();
    setTafelOffen(false);
  };
  const zumErgebnis = () => ergebnisRef.current?.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });

  return (
    <div className="mx-auto max-w-5xl pb-6">
      <div className="space-y-7">
        <EnergyInfoBar onNeuStarten={neuStarten} />
        <div className="space-y-7">
          <SparteTabs aktiv={aktiv} onChange={actions.setAktiv} gefuellt={sell.gefuellt} />
          <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
            <TodayPanel sell={sell} />
            <NewTariffPanel sell={sell} />
          </div>
          <ResultCard ref={ergebnisRef} sell={sell} onTafel={() => setTafelOffen(true)} onAbschluss={abschluss} onTeilen={teilen} />
        </div>
      </div>
      <StickySavings show={!ergebnisSichtbar && !tafelOffen} e={gesamt} onZumErgebnis={zumErgebnis} onTafel={() => setTafelOffen(true)} />
      <EnergyTafel open={tafelOffen} teile={teile} onAbschluss={abschluss} onTeilen={teilen} onClose={schliessen} />
    </div>
  );
}
