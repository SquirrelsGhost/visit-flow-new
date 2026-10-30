import { CalendarDays, MapPin, User } from "lucide-react";
import { cn } from "../../lib/cn";
import { BACKOFFICE_ADDRESS_VIEW } from "../../lib/backoffice/backofficeConfig";
import { visibleAddress } from "../../lib/backoffice/backofficeLogic";
import type { BackofficeAction } from "../../lib/backoffice/backofficeTypes";
import { formatDateTime } from "../../lib/crm/crmFormat";
import type { AdminSale, CustomerGroup } from "../../lib/crmOverview/overviewTypes";
import { backofficeTexts as t } from "../../texts/backofficeTexts";
import { GLASS_INSET } from "../glass/glassStyles";
import StreetLink from "../streets/StreetLink";
import BackofficeProduct from "./BackofficeProduct";

interface BackofficeDetailsProps {
  group: CustomerGroup;
  onAction: (action: BackofficeAction, sale: AdminSale) => void;
}

const FACT = "flex min-w-0 items-start gap-2 text-[13px]";
const FACT_LABEL = "block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--glass-label)]";

/** Aufgeklappter Kunde: Verkäufer, Datum, Adresse (je nach Datenschutz-Einstellung) und jedes Produkt mit eigenen Knöpfen. */
export default function BackofficeDetails({ group, onAction }: BackofficeDetailsProps) {
  const address = visibleAddress(group.address, BACKOFFICE_ADDRESS_VIEW);
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
            <span className="block font-medium text-foreground">{address || t.addressHidden}</span>
          </span>
          {address && <StreetLink address={group.address} className="self-center" />}
        </p>
      </div>
      <div className={cn(GLASS_INSET, "divide-y divide-[var(--glass-divider)]")}>
        <p className="px-3 pb-1.5 pt-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--glass-label)]">{t.products}</p>
        <ul>
          {group.sales.map((s) => (
            <BackofficeProduct key={s.id} sale={s} showSeller={s.userName !== group.userName} onAction={onAction} />
          ))}
        </ul>
      </div>
    </div>
  );
}
