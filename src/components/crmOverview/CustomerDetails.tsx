import { CalendarDays, MapPin, Trash2, User } from "lucide-react";
import { cn } from "../../lib/cn";
import { formatDateTime, formatEuro } from "../../lib/crm/crmFormat";
import type { AdminSale, CustomerGroup } from "../../lib/crmOverview/overviewTypes";
import { crmOverviewTexts as t } from "../../texts/crmOverviewTexts";
import OrderStatusChip from "../crm/OrderStatusChip";
import { GLASS_INSET } from "../glass/glassStyles";
import StreetLink from "../streets/StreetLink";

interface CustomerDetailsProps {
  group: CustomerGroup;
  onDeleteSale: (sale: AdminSale) => void;
  onDeleteGroup: () => void;
}

const FACT = "flex min-w-0 items-start gap-2 text-[13px]";
const FACT_LABEL = "block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--glass-label)]";

function Upsell({ sale }: { sale: AdminSale }) {
  const u = sale.upsell;
  if (!u) return null;
  return (
    <div className="mt-1.5 flex items-center justify-between gap-2 rounded-xl bg-purple-500/10 px-2.5 py-1.5 text-[12px] ring-1 ring-inset ring-purple-500/15">
      <span className="font-semibold text-purple-700 dark:text-purple-300">{t.upsell(u.grade)}</span>
      <span className="tabular-nums text-muted-foreground">
        {u.oldPrice !== undefined && <span className="line-through">{formatEuro(u.oldPrice)}</span>}
        {u.newPrice !== undefined && <span className="ml-1.5 text-foreground">{formatEuro(u.newPrice)}</span>}
        {u.diff !== undefined && <span className="ml-1.5 font-semibold text-emerald-600 dark:text-emerald-400">+{formatEuro(u.diff)}</span>}
      </span>
    </div>
  );
}

/** Aufgeklappter Kunde wie v1: Verkäufer, Datum, Adresse, Produkte mit Löschen je Produkt und Gesamtprovision. */
export default function CustomerDetails({ group, onDeleteSale, onDeleteGroup }: CustomerDetailsProps) {
  return (
    <div className="space-y-3 px-4 pb-4">
      <div className="grid grid-cols-2 gap-3">
        <p className={FACT}>
          <User aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" />
          <span className="min-w-0">
            <span className={FACT_LABEL}>{t.sellerLabel}</span>
            <span className="block truncate font-medium text-foreground">{group.userName}</span>
          </span>
        </p>
        <p className={FACT}>
          <CalendarDays aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0 text-purple-500" />
          <span className="min-w-0">
            <span className={FACT_LABEL}>{t.date}</span>
            <span className="block truncate font-medium tabular-nums text-foreground">{group.latest ? formatDateTime(group.latest) : "–"}</span>
          </span>
        </p>
        <p className={cn(FACT, "col-span-2")}>
          <MapPin aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange-500" />
          <span className="min-w-0 flex-1">
            <span className={FACT_LABEL}>{t.address}</span>
            <span className={cn("block font-medium", group.address ? "text-foreground" : "text-red-600 dark:text-red-300")}>{group.address || t.noAddress}</span>
          </span>
          <StreetLink address={group.address} className="self-center" />
        </p>
      </div>

      <div className={cn(GLASS_INSET, "divide-y divide-[var(--glass-divider)]")}>
        <p className="px-3 pb-1.5 pt-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--glass-label)]">{t.products}</p>
        <ul>
          {group.sales.map((s) => (
            <li key={s.id} className="px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="min-w-0 flex-1">
                  <span className={cn("block truncate text-[13.5px] text-foreground", s.status === "cancelled" && "text-muted-foreground line-through")}>
                    {s.quantity > 1 ? `${s.quantity}× ` : ""}
                    {s.type}
                  </span>
                  <span className="mt-0.5 block truncate text-[11.5px] text-muted-foreground">
                    {s.userName !== group.userName ? `${s.userName} · ` : ""}
                    {s.timestamp ? formatDateTime(s.timestamp) : ""}
                  </span>
                </span>
                {s.status !== "open" && <OrderStatusChip status={s.status} />}
                <span className={cn("shrink-0 text-[12.5px] font-medium tabular-nums", s.status === "cancelled" ? "text-muted-foreground line-through" : "text-emerald-600 dark:text-emerald-400")}>{formatEuro(s.commissionEuro)}</span>
                <button type="button" onClick={() => onDeleteSale(s)} aria-label={`${t.deleteProduct}: ${s.type}`} className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-500 dark:text-white/40">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <Upsell sale={s} />
              {s.note && <p className="mt-1 text-[12px] italic text-muted-foreground">{s.note}</p>}
            </li>
          ))}
        </ul>
        <p className="flex items-center justify-between px-3 py-2.5 text-[13px]">
          <span className="font-medium text-foreground">{t.total}</span>
          <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">{formatEuro(group.total)}</span>
        </p>
      </div>

      {group.sales.length > 1 && (
        <button type="button" onClick={onDeleteGroup} className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-red-500/10 text-[13px] font-semibold text-red-600 transition-[background-color,transform] duration-200 hover:bg-red-500/15 active:scale-[0.98] motion-reduce:transition-none dark:text-red-300">
          <Trash2 aria-hidden className="h-4 w-4" />
          {t.deleteCustomer}
        </button>
      )}
    </div>
  );
}
