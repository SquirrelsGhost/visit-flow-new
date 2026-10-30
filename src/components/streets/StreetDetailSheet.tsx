import type { StreetStats } from "../../lib/streets/streetGrouping";
import { streetListTexts } from "../../texts/streetListTexts";
import { cn } from "../../lib/cn";
import GlassSheet from "../glass/GlassSheet";
import { GLASS_INSET } from "../glass/glassStyles";

/** Welche Liste aus der Kopfkarte offen ist (v1 Popover Türen, Sales, Aktiv). */
export type StreetDetail = "doors" | "sales" | "active";

interface StreetDetailSheetProps {
  detail: StreetDetail | null;
  stats: StreetStats;
  onClose: () => void;
}

const texts = streetListTexts.details;
const TITLE: Record<StreetDetail, string> = { doors: texts.doors, sales: texts.sales, active: texts.active };

function lines(detail: StreetDetail, stats: StreetStats): { id: string; name: string; value: string }[] {
  if (detail === "doors") return stats.doorsByPerson.map((p) => ({ id: p.id, name: p.name, value: String(p.count) }));
  if (detail === "sales") return stats.salesByPerson.map((p) => ({ id: p.id, name: p.name, value: p.products || texts.noProducts }));
  return stats.active.map((p) => ({ id: p.id, name: p.name, value: "" }));
}

/** Aufschlüsselung je Person zu einer Kennzahl der Kopfkarte. */
export default function StreetDetailSheet({ detail, stats, onClose }: StreetDetailSheetProps) {
  const list = detail ? lines(detail, stats) : [];
  return (
    <GlassSheet open={detail !== null} onClose={onClose} title={detail ? `${TITLE[detail]} (${list.length})` : ""}>
      <div className={cn(GLASS_INSET, "p-1")}>
        {list.length === 0 && <p className="px-3 py-4 text-[13px] text-muted-foreground">{texts.empty}</p>}
        {list.map((line) => (
          <div key={line.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5">
            <span className="min-w-0 flex-1 truncate text-[14.5px] font-medium text-foreground">{line.name}</span>
            {line.value && <span className={cn("shrink-0 text-right text-[13px] tabular-nums", detail === "doors" ? "font-semibold text-foreground" : "max-w-[55%] text-emerald-700 dark:text-emerald-300")}>{line.value}</span>}
          </div>
        ))}
      </div>
    </GlassSheet>
  );
}
