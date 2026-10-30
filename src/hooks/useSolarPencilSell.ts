import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { autoOptimize, calculateSolar, DEFAULT_SOLAR, type SolarInput } from "../lib/solar/solarCalc";
import { solarProducts } from "../lib/solar/solarTransfer";
import { saveTransfer } from "../lib/tariff/pencilSellStorage";
import { solarTexts as t } from "../texts/solarTexts";

/** Eingaben, Rechnung und Aktionen des PV-Vergleichs (v1 SolarPencilSell). */
export function useSolarPencilSell() {
  const router = useRouter();
  const [input, setInput] = useState<SolarInput>(DEFAULT_SOLAR);
  const result = useMemo(() => calculateSolar(input), [input]);

  const set = useCallback((patch: Partial<SolarInput>) => setInput((prev) => ({ ...prev, ...patch })), []);

  const optimize = useCallback(() => {
    setInput((prev) => ({ ...prev, ...autoOptimize(prev.consumptionKwh) }));
    toast.success(t.optimized);
  }, []);

  /** Alles auf Anfang, mit "Rückgängig" im Hinweis (wie im Strom- und Gasvergleich). */
  const reset = useCallback(() => {
    const prev = input;
    setInput(DEFAULT_SOLAR);
    toast(t.zurueckgesetzt, { action: { label: t.rueckgaengig, onClick: () => setInput(prev) } });
  }, [input]);

  const book = useCallback(() => {
    saveTransfer(solarProducts(input));
    toast.success(t.booked);
    router.push("/dashboard");
  }, [input, router]);

  return { input, result, set, optimize, reset, book };
}

export type SolarSell = ReturnType<typeof useSolarPencilSell>;
