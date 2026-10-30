import { MapPin, X } from "lucide-react";
import { motion } from "motion/react";
import { riseIn } from "../../lib/motion/presets";
import { streetLabel, type StreetRef } from "../../lib/streets/streetLinks";
import { streetListTexts } from "../../texts/streetListTexts";
import StreetLink from "./StreetLink";

interface StreetFilterChipProps {
  street: StreetRef | null;
  onClear: () => void;
}

const texts = streetListTexts.links;

/** Aktiver Straßenfilter aus der Straßenliste: Straße, zurück zur Straße und Entfernen. */
export default function StreetFilterChip({ street, onClear }: StreetFilterChipProps) {
  if (!street) return null;
  return (
    <motion.div variants={riseIn} className="glass-surface flex min-h-12 items-center gap-2.5 rounded-2xl py-1.5 pl-3.5 pr-1.5">
      <span aria-hidden className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-orange-500/12 text-orange-600 dark:text-orange-300">
        <MapPin className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--glass-label)]">{texts.filter}</span>
        <span className="block truncate text-[14px] font-semibold text-foreground">{streetLabel(street)}</span>
      </span>
      <StreetLink street={street} compact />
      <button type="button" onClick={onClear} aria-label={texts.clear} className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-slate-500 transition-colors hover:bg-[var(--glass-hover)] hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 dark:text-white/60">
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}
