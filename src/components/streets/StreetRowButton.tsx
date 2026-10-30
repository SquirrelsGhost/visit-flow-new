import { ChevronRight, Signpost } from "lucide-react";
import { cn } from "../../lib/cn";
import type { StreetRow } from "../../lib/streets/streetTypes";
import { fill } from "../../texts/profileTexts";
import { streetListTexts } from "../../texts/streetListTexts";
import GlassIcon from "../glass/GlassIcon";
import { GLASS_CHEVRON, GLASS_ROW, GLASS_ROW_INTERACTIVE, GLASS_SUBTITLE, GLASS_TITLE } from "../glass/glassStyles";

const texts = streetListTexts.list;

/** Eine Straße: Name, Türen und Verkäufe, wer dort war; rechts die Verkäufe als grüne Zahl. */
export interface StreetRowButtonProps { row: StreetRow; onOpen: () => void }

export default function StreetRowButton({ row, onOpen }: StreetRowButtonProps) {
  const doors = row.doors.length;
  const houses = new Set(row.doors.map((d) => d.houseNumber)).size;
  const names = row.memberNames.map((n) => n.split(" ")[0] ?? n).join(", ");
  return (
    <button type="button" onClick={onOpen} className={cn(GLASS_ROW, GLASS_ROW_INTERACTIVE, "group")}>
      <GlassIcon icon={Signpost} tone={row.sales > 0 ? "green" : "purple"} />
      <span className="min-w-0 flex-1">
        <span className={cn(GLASS_TITLE, "truncate")}>{row.street}</span>
        <span className={cn(GLASS_SUBTITLE, "truncate")}>
          {houses === 1 ? texts.housesOne : fill(texts.houses, { count: houses })}
          {names && <span className="text-slate-400 dark:text-white/35"> · {names}</span>}
        </span>
      </span>
      <span className="flex shrink-0 flex-col items-end">
        <span className={cn("text-[17px] font-semibold tabular-nums leading-none", row.sales > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-slate-300 dark:text-white/25")}>{row.sales}</span>
        <span className="mt-1 text-[11px] text-muted-foreground">{doors === 1 ? texts.doorsOne : fill(texts.doors, { count: doors })}</span>
      </span>
      <ChevronRight aria-hidden className={GLASS_CHEVRON} />
    </button>
  );
}
