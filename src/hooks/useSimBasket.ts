import { useCallback, useMemo, useRef, useState } from "react";
import { baseTotal, changeQuantity, unitCount } from "../lib/simulator/simulatorBasket";
import { refineCommissions } from "../lib/simulator/simulatorApi";
import type { SimProduct } from "../lib/simulator/simulatorTypes";

export interface SimBasket {
  products: SimProduct[];
  units: number;
  base: number;
  /** Neuer Warenkorb; live holt der Simulator danach die Server-Provision je Posten */
  commit: (next: SimProduct[]) => void;
  change: (id: string, delta: number) => void;
  remove: (id: string) => void;
  clear: () => void;
}

/** Warenkorb des Simulators. Spätere Antworten des Servers überschreiben nie einen neueren Stand. */
export function useSimBasket(): SimBasket {
  const [products, setProducts] = useState<SimProduct[]>([]);
  const round = useRef(0);
  const current = useRef<SimProduct[]>([]);

  const commit = useCallback((next: SimProduct[]) => {
    const mine = ++round.current;
    current.current = next;
    setProducts(next);
    refineCommissions(next)
      .then((rates) => {
        if (!rates || mine !== round.current) return;
        const refined = next.map((p, i) => ({ ...p, commission: rates[i] ?? p.commission }));
        current.current = refined;
        setProducts(refined);
      })
      .catch(() => undefined);
  }, []);

  const change = useCallback((id: string, delta: number) => commit(changeQuantity(current.current, id, delta)), [commit]);
  const remove = useCallback((id: string) => commit(current.current.filter((p) => p.id !== id)), [commit]);
  const clear = useCallback(() => commit([]), [commit]);

  return useMemo(
    () => ({ products, units: unitCount(products), base: baseTotal(products), commit, change, remove, clear }),
    [products, commit, change, remove, clear],
  );
}
