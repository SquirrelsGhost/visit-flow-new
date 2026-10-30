// Wischen, Tastatur und Zwischenablage brauchen den Browser
"use client";

import { useCalculatorKeyboard } from "../../hooks/useCalculatorKeyboard";
import { useCalculatorState } from "../../hooks/useCalculatorState";
import { useCalculatorSwipe } from "../../hooks/useCalculatorSwipe";
import GlassPage from "../glass/GlassPage";
import CalculatorCard from "./CalculatorCard";
import CalculatorPanel from "./CalculatorPanel";
import CalculatorTabs from "./CalculatorTabs";
import PencilSellMode from "./PencilSellMode";

/**
 * Rechner-Seite aus v1 (CalculatorView) im Glas-Design: oben zwei Reiter, darunter eine Fläche zum Wischen
 * mit Tarif-Vergleich links und Taschenrechner rechts.
 */
export interface CalculatorViewProps { readonly _?: never; }

export default function CalculatorView() {
  const calc = useCalculatorState();
  const { activeTab, setActiveTab, containerRef, sliderRef } = useCalculatorSwipe();
  useCalculatorKeyboard(activeTab === "calc", calc);

  return (
    <GlassPage>
      <div ref={containerRef} className="flex h-full min-h-0 w-full flex-col gap-7 overflow-hidden pt-3 md:pt-4">
        <div className="px-4">
          <CalculatorTabs active={activeTab} onChange={setActiveTab} />
        </div>
        <div className="relative min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain pb-6">
          <div ref={sliderRef} className="flex w-[200%] items-start will-change-transform [backface-visibility:hidden]">
            <CalculatorPanel tab="pencil" active={activeTab === "pencil"} className="px-4">
              <PencilSellMode />
            </CalculatorPanel>
            <CalculatorPanel tab="calc" active={activeTab === "calc"} className="px-4">
              <CalculatorCard calc={calc} />
            </CalculatorPanel>
          </div>
        </div>
      </div>
    </GlassPage>
  );
}
