import { AlertTriangle, Clock, RotateCcw, Trash2, User } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../../lib/cn";
import { normalizeStatus, STATUS_TONE } from "../../lib/streets/streetStatus";
import type { PendingDoor } from "../../lib/streets/streetTypes";
import { fill } from "../../texts/profileTexts";
import { streetListTexts } from "../../texts/streetListTexts";
import GlassIcon from "../glass/GlassIcon";
import { GLASS_SUBTITLE, GLASS_TITLE } from "../glass/glassStyles";

interface PendingDoorCardProps {
  door: PendingDoor;
  busy: boolean;
  disabled: boolean;
  onRestore: () => void;
  onRemove: () => void;
}

const texts = streetListTexts.deletions;
const STAMP = new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
const ACTION = "flex h-11 flex-1 items-center justify-center gap-1.5 text-[13px] font-semibold transition-colors hover:bg-[var(--glass-hover)] disabled:opacity-50";

export const addressOf = (d: PendingDoor) =>
  [d.street, d.houseNumber, d.zipCode, d.city].some(Boolean) ? `${`${d.street} ${d.houseNumber}`.trim()}, ${d.zipCode} ${d.city}`.trim().replace(/,\s*$/, "") : texts.noAddress;

/** Eine Tür auf der Warteliste: Adresse, Status, wem sie gehört und wer sie melden ließ; darunter die zwei Entscheidungen. */
export default function PendingDoorCard({ door, busy, disabled, onRestore, onRemove }: PendingDoorCardProps) {
  const status = normalizeStatus(door.status);
  const requested = door.requestedByName && door.requestedByName !== "Unbekannt";
  const meta = [
    { icon: User, text: fill(texts.owner, { name: door.ownerName || streetListTexts.unknown }) },
    requested && { icon: AlertTriangle, text: fill(texts.requested, { name: door.requestedByName }), warn: true },
    !door.houseNumber.trim() && { icon: AlertTriangle, text: texts.orphan, warn: true },
    door.requestedAt && { icon: Clock, text: STAMP.format(new Date(door.requestedAt)) },
  ].filter((m): m is { icon: typeof User; text: string; warn?: boolean } => Boolean(m));

  return (
    <motion.div layout exit={{ opacity: 0, height: 0 }} className={cn("overflow-hidden transition-opacity", busy && "opacity-50")}>
      <div className="flex items-start gap-3.5 px-4 pb-2 pt-3.5">
        <GlassIcon icon={Trash2} tone={requested ? "rose" : "orange"} />
        <span className="min-w-0 flex-1">
          <span className={cn(GLASS_TITLE, "truncate")}>{door.name || streetListTexts.street.main}</span>
          <span className={cn(GLASS_SUBTITLE, "truncate")}>{addressOf(door)}</span>
          <span className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[11.5px] text-muted-foreground">
            {meta.map((m) => (
              <span key={m.text} className={cn("inline-flex items-center gap-1", m.warn && "text-amber-700 dark:text-amber-300")}>
                <m.icon aria-hidden className="h-3 w-3" /> {m.text}
              </span>
            ))}
          </span>
        </span>
        <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[11.5px] font-semibold ring-1 ring-inset", STATUS_TONE[status])}>{streetListTexts.status[status]}</span>
      </div>
      <div className="mx-4 flex divide-x divide-[var(--glass-divider)] overflow-hidden rounded-2xl ring-1 ring-inset ring-[var(--glass-divider)] mb-3.5">
        {requested && (
          <button type="button" onClick={onRestore} disabled={disabled} className={cn(ACTION, "text-blue-600 dark:text-blue-300")}>
            <RotateCcw aria-hidden className="h-3.5 w-3.5" /> {texts.restore}
          </button>
        )}
        <button type="button" onClick={onRemove} disabled={disabled} className={cn(ACTION, "text-red-600 dark:text-red-400")}>
          <Trash2 aria-hidden className="h-3.5 w-3.5" /> {texts.remove}
        </button>
      </div>
    </motion.div>
  );
}
