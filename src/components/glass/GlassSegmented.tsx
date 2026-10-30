import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../../lib/cn";
import { feedback } from "../../lib/feedback/feedback";
import { SNAPPY_SPRING } from "../../lib/motion/presets";
import { GLASS_SEGMENT_IDLE, GLASS_SEGMENT_PILL, GLASS_SEGMENT_TRACK } from "./glassStyles";

export interface GlassSegment<T extends string> {
  id: T;
  label: string;
  icon: LucideIcon;
}

interface GlassSegmentedProps<T extends string> {
  /** Name der Leiste für Screenreader. */
  label: string;
  segments: readonly GlassSegment<T>[];
  active: T;
  onChange: (id: T) => void;
  /** Eindeutiger Vorsatz für ids und die gleitende Pille, damit mehrere Leisten sich nicht stören. */
  idPrefix: string;
  /** "red": leuchtende rote Pille (Hauptreiter). "soft": helle Glaspille für eine zweite Leiste darunter. */
  tone?: "red" | "soft";
}

/** Gläserne Leiste; sie liegt über dem ruhigen Hintergrund und braucht deshalb keine teure Unschärfe. */
const TRACK = `${GLASS_SEGMENT_TRACK} mx-auto max-w-xl`;
const TAB =
  "relative flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-2xl px-1 py-2 text-[11px] font-semibold tracking-wide transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40";
const PILL_SOFT = "absolute inset-0 rounded-2xl bg-white shadow-[0_1px_2px_rgba(15,23,42,0.08),0_8px_18px_-10px_rgba(15,23,42,0.35)] ring-1 ring-black/[0.04] dark:bg-white/[0.12] dark:ring-white/10";

/**
 * Reiter als gläserne Segment-Steuerung (wie die Einstellungen): Symbol über dem Namen,
 * die leuchtende rote Fläche gleitet federnd zum gewählten Reiter.
 */
export default function GlassSegmented<T extends string>({ label, segments, active, onChange, idPrefix, tone = "red" }: GlassSegmentedProps<T>) {
  return (
    <div role="tablist" aria-label={label} className={TRACK}>
      {segments.map(({ id, label: name, icon: Icon }) => {
        const selected = id === active;
        return (
          <motion.button
            key={id}
            type="button"
            role="tab"
            id={`${idPrefix}-tab-${id}`}
            aria-selected={selected}
            aria-controls={`${idPrefix}-panel-${id}`}
            onClick={() => {
              if (!selected) feedback("select");
              onChange(id);
            }}
            whileTap={{ scale: 0.95 }}
            className={cn(TAB, selected ? (tone === "red" ? "text-white" : "text-foreground") : GLASS_SEGMENT_IDLE)}
          >
            {selected && <motion.span layoutId={`${idPrefix}-pill`} transition={SNAPPY_SPRING} className={tone === "red" ? GLASS_SEGMENT_PILL : PILL_SOFT} />}
            <Icon aria-hidden className="relative h-4 w-4" />
            <span className="relative max-w-full truncate">{name}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
