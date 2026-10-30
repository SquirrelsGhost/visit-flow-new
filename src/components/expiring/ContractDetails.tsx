import { CalendarClock, CalendarDays, MapPin, Navigation, Package, User, UserCheck, UserPlus, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "../../lib/cn";
import { mapHref } from "../../lib/expiring/expiringLogic";
import type { ExpiringContract } from "../../lib/expiring/expiringTypes";
import { expiringTexts as t } from "../../texts/expiringTexts";
import { GLASS_BUTTON_INLINE, GLASS_INSET } from "../glass/glassStyles";
import AdvisorInitial from "./AdvisorInitial";
import { FACT, FACT_LABEL, SOFT_BUTTON } from "./expiringStyles";
import { formatDay } from "../../lib/expiring/formatDay";

interface ContractDetailsProps {
  contract: ExpiringContract;
  onAssign: () => void;
}

function Fact({ icon: Icon, tone, label, value, wide }: { icon: LucideIcon; tone: string; label: string; value: string; wide?: boolean }) {
  return (
    <p className={cn(FACT, wide && "col-span-2")}>
      <Icon aria-hidden className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", tone)} />
      <span className="min-w-0">
        <span className={FACT_LABEL}>{label}</span>
        <span className="block truncate font-medium tabular-nums text-foreground">{value}</span>
      </span>
    </p>
  );
}

/** Aufgeklappter Vertrag wie v1: Tarif, Verkäufer, Laufzeit, Adresse; bei Leads der Berater bzw. "Berater zuweisen". */
export default function ContractDetails({ contract: c, onAssign }: ContractDetailsProps) {
  return (
    <div className="space-y-3 px-4 pb-4">
      <div className="grid grid-cols-2 gap-3">
        <Fact icon={Package} tone="text-purple-500" label={t.tariff} value={`${c.quantity > 1 ? `${c.quantity}× ` : ""}${c.type}`} />
        <Fact icon={User} tone="text-blue-500" label={t.seller} value={c.userName} />
        <Fact icon={CalendarDays} tone="text-slate-400" label={t.start} value={formatDay(c.startDate)} />
        <Fact icon={CalendarClock} tone="text-red-500" label={t.expiry} value={`${formatDay(c.expiryDate)} · ${t.days(c.daysLeft)}`} />
        <Fact icon={MapPin} tone="text-orange-500" label={t.address} value={c.address || t.noAddress} wide />
      </div>

      {c.isLead && c.advisorId && (
        <div className={cn(GLASS_INSET, "flex items-center gap-3 px-3 py-2.5")}>
          <AdvisorInitial name={c.advisorName ?? "?"} active />
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-600 dark:text-emerald-400">
              <UserCheck aria-hidden className="h-3 w-3" />
              {t.assignedTo}
            </span>
            <span className="block truncate text-[14px] font-semibold text-foreground">{c.advisorName}</span>
            {c.assignedAt && <span className="block text-[11.5px] text-muted-foreground">{t.assignedSince(formatDay(c.assignedAt))}</span>}
          </span>
          <button type="button" onClick={onAssign} className={cn(SOFT_BUTTON, "bg-slate-900/[0.05] text-foreground hover:bg-slate-900/[0.08] dark:bg-white/[0.06] dark:hover:bg-white/[0.1]")}>
            {t.changeAction}
          </button>
        </div>
      )}
      {!c.isLead && <p className="px-0.5 text-[12px] leading-snug text-muted-foreground">{t.noLead}</p>}

      <div className="flex gap-2">
        {c.address && (
          <Link href={mapHref(c.address)} className={cn(SOFT_BUTTON, "flex-1 bg-blue-500/10 text-blue-700 hover:bg-blue-500/15 dark:text-blue-300")}>
            <Navigation aria-hidden className="h-4 w-4" />
            {t.onMap}
          </Link>
        )}
        {c.isLead && !c.advisorId && (
          <button type="button" onClick={onAssign} className={cn(GLASS_BUTTON_INLINE, "h-10 flex-1 rounded-xl px-3 text-[13px]")}>
            <UserPlus aria-hidden className="h-4 w-4" />
            {t.assignAction}
          </button>
        )}
      </div>
    </div>
  );
}
