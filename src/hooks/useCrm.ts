import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { Vertical } from "../lib/battle/battleCategories";
import * as api from "../lib/crm/crmApi";
import { feedback } from "../lib/feedback/feedback";
import { groupOrders, monthCounts, ordersOfVertical } from "../lib/crm/crmLogic";
import type { Order, SaleRecord } from "../lib/crm/crmTypes";
import { crmTexts as t } from "../texts/crmTexts";

/** `product`: nur ein Produkt des Auftrags (v1 Einzel-Storno). */
export type CrmAction = { kind: "complete" | "cancel" | "discard"; ids: readonly string[]; product?: boolean };

const errorText = (e: unknown, fallback: string) => (e instanceof Error && e.message ? e.message : fallback);

function successText(action: CrmAction): string {
  if (action.kind === "complete") return t.completedToast;
  if (action.kind === "discard") return t.discardedToast;
  return action.product ? t.productCancelledToast : t.cancelledToast;
}

/**
 * Aufträge des eigenen Kontos (v1 CRMPage): lädt die Verkäufe, gruppiert sie je Tür und Tag
 * und führt Abschließen, Stornieren und Verwerfen aus. Folgt dem Bereich.
 */
export function useCrm(vertical: Vertical) {
  const [sales, setSales] = useState<SaleRecord[] | null>(null);
  const [busy, setBusy] = useState(false);
  const request = useRef(0);

  const load = useCallback(() => {
    const id = ++request.current;
    return api
      .loadSales()
      .then((next) => id === request.current && setSales(next))
      .catch((e: unknown) => {
        if (id !== request.current) return;
        setSales((prev) => prev ?? []);
        toast.error(errorText(e, t.loadError));
      });
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const orders = useMemo<Order[]>(() => groupOrders(ordersOfVertical(sales ?? [], vertical)), [sales, vertical]);
  const counts = useMemo(() => monthCounts(orders), [orders]);

  const run = useCallback(
    async (action: CrmAction) => {
      setBusy(true);
      try {
        if (action.kind === "discard") await api.discard(action.ids);
        else await api.setStatus(action.ids, action.kind === "complete" ? "completed" : "cancelled");
        if (action.kind !== "complete") feedback("storno");
        toast.success(successText(action));
        await load();
        return true;
      } catch (e) {
        toast.error(errorText(e, t.updateError));
        return false;
      } finally {
        setBusy(false);
      }
    },
    [load],
  );

  return { loading: sales === null, orders, counts, busy, run, reload: load };
}
