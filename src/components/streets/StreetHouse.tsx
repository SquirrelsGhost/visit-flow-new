import { Check, Home } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../../lib/cn";
import { productText, STATUS_TONE } from "../../lib/streets/streetStatus";
import type { StreetDoor } from "../../lib/streets/streetTypes";
import { streetListTexts } from "../../texts/streetListTexts";
import { GLASS_INSET } from "../glass/glassStyles";

interface StreetHouseProps {
  street: string;
  house: { houseNumber: string; doors: StreetDoor[] };
  selecting: boolean;
  selected: ReadonlySet<string>;
  onToggle: (id: string) => void;
}

const texts = streetListTexts;

function DoorLine({ door, label, selecting, checked, onToggle }: { door: StreetDoor; label: string; selecting: boolean; checked: boolean; onToggle: () => void }) {
  const products = door.status === "sale" && door.products.length > 0 ? productText(door.products) : "";
  const body = (
    <>
      {selecting && (
        <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full ring-1 ring-inset transition-colors", checked ? "bg-red-500 text-white ring-red-500" : "ring-slate-300 dark:ring-white/25")}>
          {checked && <Check aria-hidden className="h-3 w-3" strokeWidth={3} />}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14px] font-medium text-foreground">{label}</span>
        <span className="block truncate text-[12px] text-muted-foreground">
          {door.memberName}
          {products && <span className="text-emerald-700 dark:text-emerald-300"> · {products}</span>}
        </span>
      </span>
      <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[11.5px] font-semibold ring-1 ring-inset", STATUS_TONE[door.status])}>{texts.status[door.status]}</span>
    </>
  );
  const base = cn("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left", checked && "bg-red-500/[0.07]");
  if (!selecting) return <div className={base}>{body}</div>;
  return (
    <motion.button type="button" whileTap={{ scale: 0.98 }} onClick={onToggle} aria-pressed={checked} className={cn(base, "transition-colors hover:bg-[var(--glass-hover)]")}>
      {body}
    </motion.button>
  );
}

/** Ein Haus der Straße; mehrere Türen = MFH mit Kopfzeile, sonst eine Zeile mit Straße und Hausnummer (wie v1). */
export default function StreetHouse({ street, house, selecting, selected, onToggle }: StreetHouseProps) {
  const mfh = house.doors.length > 1;
  return (
    <div className={cn(GLASS_INSET, "p-1")}>
      {mfh && (
        <div className="flex items-center gap-2 px-3 pb-1 pt-2 text-[12.5px] font-semibold text-foreground">
          <Home aria-hidden className="h-3.5 w-3.5 text-muted-foreground" />
          {street} {house.houseNumber}
          <span className="rounded-full bg-indigo-500/12 px-1.5 py-px text-[10.5px] font-bold uppercase tracking-wide text-indigo-600 dark:text-indigo-300">{texts.street.mfh}</span>
        </div>
      )}
      {house.doors.map((door) => (
        <DoorLine
          key={door.id}
          door={door}
          label={mfh ? door.customerName || texts.street.main : `${street} ${house.houseNumber}${door.customerName ? ` (${door.customerName})` : ""}`}
          selecting={selecting}
          checked={selected.has(door.id)}
          onToggle={() => onToggle(door.id)}
        />
      ))}
    </div>
  );
}
