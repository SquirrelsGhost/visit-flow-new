import { CalendarDays, Check, MapPin, StickyNote, Trash2, X } from "lucide-react";
import { formatDateTime, formatEuro } from "../../lib/crm/crmFormat";
import type { Order, OrderProduct } from "../../lib/crm/crmTypes";
import { cn } from "../../lib/cn";
import { crmTexts as t } from "../../texts/crmTexts";
import { GLASS_INSET } from "../glass/glassStyles";
import StreetLink from "../streets/StreetLink";

interface OrderDetailsProps {
  order: Order;
  editable: boolean;
  completable: boolean;
  onCancel: () => void;
  onComplete: () => void;
  onDiscard: () => void;
  onCancelProduct: (product: OrderProduct) => void;
}

const DISCARD = "bg-slate-900/[0.05] text-slate-600 hover:bg-slate-900/[0.08] dark:bg-white/[0.06] dark:text-white/70";
const ACTION = "inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl text-[13px] font-semibold transition-[filter,transform,background-color] duration-200 active:scale-[0.98] disabled:opacity-45 motion-reduce:transition-none";

/** Aufgeklappter Auftrag: Adresse (mit "Straße öffnen"), Datum, Produkte mit Einzel-Storno, Notiz, Stornogrund und Aktionen. */
export default function OrderDetails({ order, editable, completable, onCancel, onComplete, onDiscard, onCancelProduct }: OrderDetailsProps) {
  const many = order.products.length > 1;
  return (
    <div className="space-y-3 px-4 pb-4">
      <div className="space-y-1.5 text-[13px] text-muted-foreground">
        <p className="flex items-center gap-2">
          <MapPin aria-hidden className="h-3.5 w-3.5 shrink-0" />
          <span className="min-w-0 flex-1 truncate">{order.address || t.noAddress}</span>
          <StreetLink address={order.address} className="-my-1.5 h-8" />
        </p>
        <p className="flex items-center gap-2">
          <CalendarDays aria-hidden className="h-3.5 w-3.5 shrink-0" />
          {t.createdOn} {formatDateTime(order.timestamp)}
        </p>
      </div>

      <div className={cn(GLASS_INSET, "divide-y divide-[var(--glass-divider)]")}>
        <p className="px-3 pb-1.5 pt-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--glass-label)]">{t.sold}</p>
        <ul>
          {order.products.map((p) => (
            <li key={p.id} className="flex items-center gap-2 px-3 py-2">
              <span className={cn("min-w-0 flex-1 text-[13.5px] text-foreground", p.status === "cancelled" && "text-muted-foreground line-through")}>
                {p.quantity > 1 ? `${p.quantity}× ` : ""}
                {p.type}
              </span>
              {p.commissionEuro > 0 && (
                <span className={cn("shrink-0 text-[12.5px] font-medium tabular-nums", p.status === "cancelled" ? "text-muted-foreground line-through" : "text-emerald-600 dark:text-emerald-400")}>{formatEuro(p.commissionEuro)}</span>
              )}
              {editable && many && p.status === "open" && (
                <button type="button" onClick={() => onCancelProduct(p)} aria-label={`${t.cancelProduct}: ${p.type}`} className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-500 dark:text-white/40">
                  <X className="h-3.5 w-3.5" strokeWidth={2.4} />
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      {order.note && (
        <p className="flex gap-2 text-[13px] italic text-muted-foreground">
          <StickyNote aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {order.note}
        </p>
      )}
      {order.lostReason && (
        <p className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/10 px-2.5 py-1 text-[12px] font-medium text-red-600 ring-1 ring-inset ring-red-500/15 dark:text-red-300">
          <span aria-hidden className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-red-500 motion-reduce:animate-none" />
          {t.lostReason}: {order.lostReason}
        </p>
      )}

      {editable ? (
        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onCancel} className={cn(ACTION, "bg-red-500/10 text-red-600 hover:bg-red-500/15 dark:text-red-300")}>
            <X aria-hidden className="h-4 w-4" strokeWidth={2.4} />
            {t.cancel}
          </button>
          <button type="button" onClick={onComplete} disabled={!completable} className={cn(ACTION, "bg-emerald-500/12 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300")}>
            <Check aria-hidden className="h-4 w-4" strokeWidth={2.4} />
            {t.complete}
          </button>
          <button type="button" onClick={onDiscard} aria-label={t.discard} title={t.discardHint} className={cn(ACTION, DISCARD, "flex-none px-3.5")}>
            <Trash2 aria-hidden className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button type="button" onClick={onDiscard} className={cn(ACTION, DISCARD, "w-full")}>
          <Trash2 aria-hidden className="h-4 w-4" />
          {t.discardHint}
        </button>
      )}
    </div>
  );
}
