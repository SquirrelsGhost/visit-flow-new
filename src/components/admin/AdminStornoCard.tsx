import { STORNO_LIMIT } from "../../lib/crm/crmLogic";
import type { MonthCounts } from "../../lib/crm/crmTypes";
import { adminTexts } from "../../texts/adminTexts";
import { fill } from "../../texts/profileTexts";
import GlassChip from "../glass/GlassChip";
import GlassNumber from "../glass/GlassNumber";
import GlassRing from "../glass/GlassRing";
import AdminPanel from "./AdminPanel";
import AdminTile from "./AdminTile";

interface AdminStornoCardProps {
  month: MonthCounts;
}

const texts = adminTexts.storno;

/** Ringfarbe: grün bis zur Bonusgrenze, bernstein knapp darüber, rot deutlich darüber. */
const toneOf = (quote: number) => (quote <= STORNO_LIMIT ? "green" : quote <= STORNO_LIMIT + 5 ? "amber" : "red");

/** Stornoquote aller Teams im Monat; der Ring ist auf das Doppelte der Grenze skaliert, damit Bewegung sichtbar wird. */
export default function AdminStornoCard({ month }: AdminStornoCardProps) {
  const quote = month.quote;
  const tone = quote === null ? "green" : toneOf(quote);
  const orders = month.sales + month.stornos;
  return (
    <AdminPanel
      label={texts.label}
      aside={<GlassChip tone={tone === "red" ? "red" : tone === "amber" ? "amber" : "green"}>{fill(texts.limit, { limit: STORNO_LIMIT })}</GlassChip>}
      footer={fill(texts.footer, { limit: STORNO_LIMIT })}
    >
      <div className="flex flex-col items-center gap-4 min-[440px]:flex-row min-[440px]:gap-5">
        <GlassRing share={(quote ?? 0) / (STORNO_LIMIT * 2)} tone={tone} size={116} label={texts.ring}>
          {quote === null ? (
            <span className="px-3 text-center text-[11.5px] font-medium leading-tight text-muted-foreground">{texts.none}</span>
          ) : (
            <GlassNumber value={Math.round(quote)} kind="percent" className="text-[26px] font-semibold tracking-[-0.03em] text-foreground" />
          )}
        </GlassRing>
        <div className="grid w-full min-w-0 flex-1 grid-cols-2 gap-2.5">
          <AdminTile label={texts.orders} value={orders} />
          <AdminTile label={texts.cancelled} value={month.stornos} warn />
          <AdminTile label={texts.open} value={month.open} />
          <AdminTile label={texts.completed} value={month.completed} />
        </div>
      </div>
    </AdminPanel>
  );
}
