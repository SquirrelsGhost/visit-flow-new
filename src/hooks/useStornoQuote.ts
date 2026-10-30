import { useEffect, useState } from "react";
import type { Vertical } from "../lib/battle/battleCategories";
import { loadSales } from "../lib/crm/crmApi";
import { groupOrders, monthCounts, ordersOfVertical } from "../lib/crm/crmLogic";

/** undefined = lädt noch, null = keine Aufträge im Monat. */
export type StornoQuote = number | null | undefined;

/** Stornoquote des laufenden Monats aus den Aufträgen (/crm), z. B. für den Bonus im Simulator. */
export function useStornoQuote(vertical: Vertical): StornoQuote {
  const [quote, setQuote] = useState<{ vertical: Vertical; value: number | null } | null>(null);
  useEffect(() => {
    let alive = true;
    loadSales()
      .then((sales) => alive && setQuote({ vertical, value: monthCounts(groupOrders(ordersOfVertical(sales, vertical))).quote }))
      .catch(() => alive && setQuote({ vertical, value: null }));
    return () => {
      alive = false;
    };
  }, [vertical]);
  return quote?.vertical === vertical ? quote.value : undefined;
}
