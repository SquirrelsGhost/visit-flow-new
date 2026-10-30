import { useEffect } from "react";
import type { CalculatorState } from "./useCalculatorState";

const CALC_KEY = /^[0-9+\-*/.%()]$/;

/**
 * Tastatur für den Rechner (v1 CalculatorView): Ziffern und Operatoren, Enter/= rechnet,
 * Backspace löscht, Escape leert. Strg/Cmd-Kürzel (Kopieren, Einfügen) bleiben unberührt.
 */
export function useCalculatorKeyboard(active: boolean, calc: CalculatorState) {
  const { append, back, clear, calculateEquals } = calc;
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const handled = CALC_KEY.test(e.key) || ["=", "Enter", "Backspace", "Escape"].includes(e.key);
      if (!handled) return;
      e.preventDefault();
      if (e.key === "Escape") clear();
      else if (e.key === "Backspace") back();
      else if (e.key === "Enter" || e.key === "=") calculateEquals();
      else append(e.key);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, append, back, clear, calculateEquals]);
}
