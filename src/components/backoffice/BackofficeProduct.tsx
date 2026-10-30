import { Check, Trash2, X } from "lucide-react";
import { cn } from "../../lib/cn";
import { BACKOFFICE_CAN_DELETE } from "../../lib/backoffice/backofficeConfig";
import { isDecidable } from "../../lib/backoffice/backofficeLogic";
import type { BackofficeAction } from "../../lib/backoffice/backofficeTypes";
import { formatDateTime, formatEuro } from "../../lib/crm/crmFormat";
import type { AdminSale } from "../../lib/crmOverview/overviewTypes";
import { backofficeTexts as t } from "../../texts/backofficeTexts";
import OrderStatusChip from "../crm/OrderStatusChip";

interface BackofficeProductProps {
  sale: AdminSale;
  /** Verkäufer nur zeigen, wenn er vom Kunden-Verkäufer abweicht. */
  showSeller: boolean;
  onAction: (action: BackofficeAction, sale: AdminSale) => void;
}

const ICON_BUTTON = "grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors duration-200";

/** Ein Produkt mit Status und kleinen Knöpfen je nach Stand: offen → bestätigen/stornieren, sonst nur löschen. */
export default function BackofficeProduct({ sale: s, showSeller, onAction }: BackofficeProductProps) {
  const decidable = isDecidable(s);
  return (
    <li className="px-3 py-2">
      <div className="flex items-center gap-2" role="group" aria-label={t.productActions(s.type)}>
        <span className="min-w-0 flex-1">
          <span className={cn("block truncate text-[13.5px] text-foreground", s.status === "cancelled" && "text-muted-foreground line-through")}>
            {s.quantity > 1 ? `${s.quantity}× ` : ""}
            {s.type}
          </span>
          <span className="mt-0.5 block truncate text-[11.5px] text-muted-foreground">
            {showSeller ? `${s.userName} · ` : ""}
            {s.timestamp ? formatDateTime(s.timestamp) : ""}
            {!decidable ? ` · ${t.lead}` : ""}
          </span>
        </span>
        <OrderStatusChip status={s.status} />
        <span className={cn("w-16 shrink-0 text-right text-[12.5px] font-medium tabular-nums", s.status === "cancelled" ? "text-muted-foreground line-through" : "text-emerald-600 dark:text-emerald-400")}>{formatEuro(s.commissionEuro)}</span>
        {decidable && s.status !== "completed" && (
          <button type="button" onClick={() => onAction("complete", s)} aria-label={`${t.complete}: ${s.type}`} className={cn(ICON_BUTTON, "text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400")}>
            <Check className="h-4 w-4" strokeWidth={2.6} />
          </button>
        )}
        {decidable && s.status !== "cancelled" && (
          <button type="button" onClick={() => onAction("cancel", s)} aria-label={`${t.cancel}: ${s.type}`} className={cn(ICON_BUTTON, "text-red-500 hover:bg-red-500/10")}>
            <X className="h-4 w-4" strokeWidth={2.6} />
          </button>
        )}
        {BACKOFFICE_CAN_DELETE && decidable && (
          <button type="button" onClick={() => onAction("delete", s)} aria-label={`${t.delete}: ${s.type}`} className={cn(ICON_BUTTON, "text-slate-400 hover:bg-red-500/10 hover:text-red-500 dark:text-white/40")}>
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {s.note && <p className="mt-1 text-[12px] italic text-muted-foreground">{s.note}</p>}
    </li>
  );
}
