import { MessageSquareWarning } from "lucide-react";
import { itemDelta, monthLabel } from "../../lib/abrechnung/abrechnungFormat";
import type { AbrechnungItem } from "../../lib/abrechnung/abrechnungTypes";
import { cn } from "../../lib/cn";
import { eur } from "../../lib/tariff/eur";
import { abrechnungTexts as t } from "../../texts/abrechnungTexts";
import { INSET } from "./abrechnungStyles";

interface ItemDetailsProps {
  item: AbrechnungItem;
}

/** Aufgeklappte Einzelheiten einer Position: beide Beträge, Differenz und die Kennungen aus der Abrechnung. */
export default function ItemDetails({ item }: ItemDetailsProps) {
  const delta = itemDelta(item);
  const rows: [string, string | undefined][] = [
    [t.detail.date, item.date],
    [t.detail.product, item.product],
    [t.detail.app, item.status === "missing_in_system" ? "–" : eur(item.amountSystem || 0)],
    [t.detail.billing, item.status === "missing_in_pdf" || item.status === "pending" ? "–" : eur(item.amountPdf || 0)],
    [t.detail.webOrder, item.webOrderId],
    [t.detail.contract, item.contractNumber],
    [t.detail.customerNo, item.customerNumber],
    [t.detail.place, [item.zipCode, item.city].filter(Boolean).join(" ") || undefined],
    [t.detail.billingMonth, item.billingMonth != null && item.billingYear != null ? monthLabel({ month: item.billingMonth, year: item.billingYear }) : undefined],
  ];
  return (
    <div className={cn(INSET, "mt-3 p-3")}>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-3">
        {rows
          .filter(([, v]) => v)
          .map(([label, value]) => (
            <div key={label} className="min-w-0">
              <dt className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase dark:text-neutral-500">{label}</dt>
              <dd className="mt-0.5 truncate text-sm text-slate-800 tabular-nums dark:text-neutral-100">{value}</dd>
            </div>
          ))}
        {delta !== null && (
          <div className="min-w-0">
            <dt className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase dark:text-neutral-500">{t.detail.delta}</dt>
            <dd className={cn("mt-0.5 text-sm font-semibold tabular-nums", delta < 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400")}>
              {`${delta > 0 ? "+" : "−"}${eur(Math.abs(delta))}`}
            </dd>
          </div>
        )}
      </dl>
      {item.reklamiert && item.reklamationReason && (
        <p className="mt-3 flex items-start gap-1.5 border-t border-slate-200/70 pt-2.5 text-xs font-medium text-amber-700 dark:border-white/[0.06] dark:text-amber-400">
          <MessageSquareWarning className="mt-px h-3.5 w-3.5 shrink-0" />
          <span>
            {item.reklamationReason}
            {item.reklamationNote ? ` · ${item.reklamationNote}` : ""}
          </span>
        </p>
      )}
    </div>
  );
}
