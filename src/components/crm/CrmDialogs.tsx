import { useLastDefined } from "../../hooks/useLastDefined";
import { formatEuro } from "../../lib/crm/crmFormat";
import type { Order, OrderProduct } from "../../lib/crm/crmTypes";
import { crmTexts as t } from "../../texts/crmTexts";
import ConfirmDialog from "../profile/ConfirmDialog";

export type CrmConfirm = { kind: "cancel" | "discard"; order: Order } | { kind: "product"; order: Order; product: OrderProduct };

interface CrmDialogsProps {
  confirm: CrmConfirm | null;
  busy: boolean;
  onClose: () => void;
  onConfirm: (confirm: CrmConfirm) => void;
}

function copy(c: CrmConfirm): { title: string; body: string; action: string } {
  if (c.kind === "product") return { title: t.cancelProductTitle, body: t.cancelProductBody(c.product.type), action: t.cancelProduct };
  if (c.kind === "discard") return { title: t.discardTitle, body: t.discardBody(c.order.customerName), action: t.discard };
  return { title: t.cancelTitle, body: t.cancelBody(c.order.customerName), action: t.cancel };
}

/** Rückfrage vor Storno (zählt zur Quote) und Verwerfen (zählt nicht), wie die v1-Dialoge mit Kunde und Umsatz. */
export default function CrmDialogs({ confirm, busy, onClose, onConfirm }: CrmDialogsProps) {
  const shown = useLastDefined(confirm);
  const text = shown ? copy(shown) : null;
  return (
    <ConfirmDialog open={!!confirm} title={text?.title ?? ""} confirmLabel={text?.action ?? ""} cancelLabel={t.back} busy={busy} onClose={onClose} onConfirm={() => shown && onConfirm(shown)}>
      {shown && text && (
        <>
          <p>{text.body}</p>
          {shown.kind !== "product" && (
            <p className="mt-3 flex justify-between text-[13px]">
              <span>{t.productCount(shown.order.products.length)}</span>
              <span className="font-semibold tabular-nums text-foreground">{formatEuro(shown.order.totalCommission)}</span>
            </p>
          )}
        </>
      )}
    </ConfirmDialog>
  );
}
