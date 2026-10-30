import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { toast } from "sonner";
import { energyProducts } from "../lib/energy/energyTransfer";
import { teilenText } from "../lib/energy/energyShare";
import type { EnergyState } from "../lib/energy/energyState";
import type { TafelTeil } from "../lib/energy/energyTafel";
import { saveTransfer } from "../lib/tariff/pencilSellStorage";
import { energyTexts as t } from "../texts/energyTexts";
import { useAuth } from "./useAuth";

/** "Abschluss übernehmen" und "Teilen" des Energievergleichs (v1 abschluss/teilen). */
export function useEnergyActions(state: EnergyState, teile: TafelTeil[]) {
  const router = useRouter();
  const { user } = useAuth();

  const abschluss = useCallback(() => {
    const products = energyProducts(state, teile);
    if (products.length === 0) return;
    saveTransfer(products);
    toast.success(t.uebernommen);
    router.push("/dashboard");
  }, [state, teile, router]);

  const teilen = useCallback(async () => {
    const text = teilenText({
      strom: teile.find((x) => x.sparte === "strom")?.ergebnis,
      gas: teile.find((x) => x.sparte === "gas")?.ergebnis,
      berater: user?.name,
    });
    try {
      if (navigator.share) return void (await navigator.share({ text }));
      await navigator.clipboard.writeText(text);
      toast.success(t.kopiert);
    } catch (e) {
      if ((e as { name?: string } | null)?.name !== "AbortError") toast.error(t.teilenFehler);
    }
  }, [teile, user]);

  return { abschluss, teilen };
}
