import { cn } from "../../lib/cn";
import type { PersonActivity } from "../../lib/streets/streetActivity";
import { streetListTexts } from "../../texts/streetListTexts";
import { GLASS_ROW, GLASS_TITLE } from "../glass/glassStyles";
import OrgAvatar from "../teams/OrgAvatar";

const texts = streetListTexts.activity;
const EURO = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

/** Eine Person: Tage mit Türen groß rechts, darunter Verkäufe, Umsatz, Türen und die Produkt-Aufschlüsselung (v1). */
export interface ActivityRowProps { activity: PersonActivity; top: boolean }

export default function ActivityRow({ activity, top }: ActivityRowProps) {
  const { person, days, doors, sales, revenue, breakdown } = activity;
  const idle = days === 0;
  return (
    <div className={cn(GLASS_ROW, "items-start", idle && "opacity-55", top && "bg-gradient-to-r from-red-500/[0.07] to-transparent")}>
      <OrgAvatar name={person.name} role={person.role} dot={idle ? "bg-slate-300 dark:bg-white/20" : "bg-emerald-500"} />
      <span className="min-w-0 flex-1">
        <span className={cn(GLASS_TITLE, "truncate")}>{person.name}</span>
        <span className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[12.5px] tabular-nums text-muted-foreground">
          <span>
            <b className={cn("font-semibold", sales > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-foreground")}>{sales}</b> {texts.sales}
          </span>
          <span>
            <b className="font-semibold text-foreground">{EURO.format(revenue)}</b> {texts.revenue}
          </span>
          <span>
            <b className="font-semibold text-foreground">{doors}</b> {texts.doors}
          </span>
        </span>
        {breakdown.length > 0 && <span className="mt-1 block truncate text-[11.5px] text-slate-400 dark:text-white/40">{breakdown.map((b) => `${b.count}x ${b.short}`).join(" · ")}</span>}
      </span>
      <span className="flex shrink-0 flex-col items-end pt-0.5">
        <span className={cn("text-[20px] font-semibold leading-none tabular-nums", idle ? "text-slate-300 dark:text-white/25" : "text-foreground")}>{days}</span>
        <span className="mt-1 text-[11px] text-muted-foreground">{days === 1 ? texts.dayOne : texts.days}</span>
      </span>
    </div>
  );
}
