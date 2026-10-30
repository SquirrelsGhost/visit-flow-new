import { ChevronRight, Plus } from "lucide-react";
import { cn } from "../../lib/cn";
import { initialOf } from "../../lib/licenses/licenseLogic";
import type { SeatRow } from "../../lib/licenses/licenseTypes";
import { licenseTexts } from "../../texts/licenseTexts";
import { fill } from "../../texts/profileTexts";
import GlassRowText from "../glass/GlassRowText";
import { GLASS_CHEVRON, GLASS_ROW, GLASS_ROW_INTERACTIVE } from "../glass/glassStyles";
import PersonRow from "./PersonRow";
import StateChip from "./StateChip";

interface SeatListRowProps {
  row: SeatRow;
  onOpen: (row: SeatRow) => void;
}

const texts = licenseTexts.members;

/** Ein Platz der Mitgliederliste: Person mit Status oder freie Lizenz mit Plus. Tippen öffnet das passende Sheet. */
export default function SeatListRow({ row, onOpen }: SeatListRowProps) {
  if (row.kind === "member") {
    const slot = fill(texts.slot, { slot: row.slot });
    return (
      <PersonRow
        initial={initialOf(row.name, row.email)}
        muted={row.state !== "active"}
        title={row.name ?? row.email}
        subtitle={row.name ? `${slot} · ${row.email}` : slot}
        chip={<StateChip seat={row.state} />}
        onClick={() => onOpen(row)}
      />
    );
  }
  return (
    <button type="button" onClick={() => onOpen(row)} className={cn(GLASS_ROW, GLASS_ROW_INTERACTIVE, "group")}>
      <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[1.5px] border-dashed border-slate-300 text-slate-400 transition-colors duration-300 group-hover:border-red-400 group-hover:text-red-500 dark:border-white/20 dark:text-white/40">
        <Plus className="h-4 w-4" />
      </span>
      <GlassRowText title={texts.freeTitle} subtitle={`${fill(texts.slot, { slot: row.slot })} · ${texts.freeText}`} />
      <ChevronRight aria-hidden className={GLASS_CHEVRON} />
    </button>
  );
}
