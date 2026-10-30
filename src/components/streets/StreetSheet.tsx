import { CheckSquare, MapPin, Pencil, Receipt, Trash2, UserPlus, X } from "lucide-react";
import Link from "next/link";
import { cn } from "../../lib/cn";
import { housesOf } from "../../lib/streets/streetGrouping";
import { crmHref } from "../../lib/streets/streetLinks";
import type { StreetScope } from "../../lib/streets/streetScope";
import type { StreetRow } from "../../lib/streets/streetTypes";
import { fill } from "../../texts/profileTexts";
import { streetListTexts } from "../../texts/streetListTexts";
import GlassSheet from "../glass/GlassSheet";
import { GLASS_BUTTON_INLINE } from "../glass/glassStyles";
import StreetHouse from "./StreetHouse";

interface StreetSheetProps {
  row: StreetRow | undefined;
  open: boolean;
  scope: StreetScope;
  selecting: boolean;
  selected: ReadonlySet<string>;
  onSelecting: (on: boolean) => void;
  onToggle: (id: string) => void;
  onAction: (action: "assign" | "edit" | "delete") => void;
  onClose: () => void;
}

const texts = streetListTexts.street;
const links = streetListTexts.links;
const PILL = "glass-surface inline-flex h-11 min-h-11 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-semibold text-foreground transition-colors duration-300 hover:bg-[var(--glass-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40";

/** Karten-Suche mit der Adresse der Straße (die Karte springt dorthin). */
export const mapHref = (row: Pick<StreetRow, "street" | "zipCode" | "city">, houseNumber = "") =>
  `/dashboard?q=${encodeURIComponent(`${row.street} ${houseNumber}`.trim() + `, ${row.zipCode} ${row.city}`)}`;

/** Häuser und Türen einer Straße (v1 Straßenblock), dazu Zuweisen, Karte, Verkäufe im CRM und beim Admin Auswählen, Bearbeiten, Löschen. */
export default function StreetSheet({ row, open, scope, selecting, selected, onSelecting, onToggle, onAction, onClose }: StreetSheetProps) {
  if (!row) return null;
  const houses = housesOf(row);
  const count = selected.size;
  return (
    <GlassSheet open={open} onClose={onClose} title={row.street} subtitle={`${row.zipCode} ${row.city} · ${fill(texts.owners, { names: row.memberNames.join(", ") })}`}>
      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {scope.canAssign && (
          <button type="button" onClick={() => onAction("assign")} className={PILL}>
            <UserPlus aria-hidden className="h-4 w-4" /> {texts.assign}
          </button>
        )}
        <Link href={mapHref(row)} className={PILL}>
          <MapPin aria-hidden className="h-4 w-4" /> {texts.map}
        </Link>
        <Link href={crmHref(scope.crm, row)} aria-label={scope.crm.own ? links.ownSalesLabel : links.salesLabel} className={PILL}>
          <Receipt aria-hidden className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> {scope.crm.own ? links.ownSales : links.sales}
        </Link>
        {scope.canManage && (
          <button type="button" onClick={() => onSelecting(!selecting)} className={cn(PILL, selecting && "!bg-red-500/10 text-red-600 dark:text-red-300")}>
            {selecting ? <X aria-hidden className="h-4 w-4" /> : <CheckSquare aria-hidden className="h-4 w-4" />} {selecting ? texts.done : texts.select}
          </button>
        )}
      </div>
      {!scope.canAssign && <p className="text-[12px] text-muted-foreground">{texts.assignOnly}</p>}
      {selecting && <p className="text-[12.5px] text-muted-foreground">{texts.selectHint}</p>}
      <div className="space-y-2.5">
        {houses.map((house) => (
          <StreetHouse key={house.houseNumber} street={row.street} house={house} selecting={selecting} selected={selected} onToggle={onToggle} />
        ))}
      </div>
      {selecting && count > 0 && (
        <div className="sticky bottom-0 -mx-5 flex gap-2 bg-gradient-to-t from-[rgba(246,247,251,0.98)] via-[rgba(246,247,251,0.9)] to-transparent px-5 pb-1 pt-4 dark:from-[rgba(14,16,25,0.98)] dark:via-[rgba(14,16,25,0.9)]">
          <button type="button" onClick={() => onAction("edit")} className={cn(PILL, "h-12 flex-1 justify-center rounded-2xl")}>
            <Pencil aria-hidden className="h-4 w-4" /> {fill(texts.edit, { count })}
          </button>
          <button type="button" onClick={() => onAction("delete")} className={cn(GLASS_BUTTON_INLINE, "flex-1")}>
            <Trash2 aria-hidden className="h-4 w-4" /> {fill(texts.delete, { count })}
          </button>
        </div>
      )}
    </GlassSheet>
  );
}
