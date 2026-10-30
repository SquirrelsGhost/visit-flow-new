import { useCallback, useEffect, useState } from "react";
import type { Tafel } from "../lib/energy/energyTafel";

/**
 * Schritte durch die Tafeln (v1 EnergyTafel): jede Zeile einzeln, danach die Ersparnis, dann die nächste Tafel.
 * Sperrt solange das Scrollen der Seite und schließt mit Escape.
 */
export function useTafelSteps(tafeln: Tafel[], onClose: () => void) {
  const [pos, setPos] = useState({ tafel: 0, gezeigt: 0 });
  const index = Math.min(pos.tafel, tafeln.length - 1);
  const tafel = tafeln[index]!;
  const max = tafel.zeilen.length + 1;

  useEffect(() => {
    const vorher = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (ev: KeyboardEvent) => ev.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = vorher;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const weiter = useCallback(
    () =>
      setPos((p) => {
        const m = tafeln[p.tafel]!.zeilen.length + 1;
        if (p.gezeigt < m) return { ...p, gezeigt: p.gezeigt + 1 };
        return p.tafel < tafeln.length - 1 ? { tafel: p.tafel + 1, gezeigt: 0 } : p;
      }),
    [tafeln],
  );

  const zurueck = useCallback(
    () =>
      setPos((p) => {
        if (p.gezeigt > 0) return { ...p, gezeigt: p.gezeigt - 1 };
        if (p.tafel === 0) return p;
        return { tafel: p.tafel - 1, gezeigt: tafeln[p.tafel - 1]!.zeilen.length + 1 };
      }),
    [tafeln],
  );

  const allesZeigen = useCallback(() => setPos((p) => ({ ...p, gezeigt: max })), [max]);

  return {
    tafel,
    gezeigt: pos.gezeigt,
    fertig: pos.gezeigt >= max,
    letzte: index >= tafeln.length - 1,
    amAnfang: pos.tafel === 0 && pos.gezeigt === 0,
    naechste: tafeln[index + 1],
    weiter,
    zurueck,
    allesZeigen,
  };
}
