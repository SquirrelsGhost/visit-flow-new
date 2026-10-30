// Aufklappen und Höhen-Animation brauchen den Browser
"use client";

import { ArrowRight, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "../../lib/cn";
import { formatKm, timeRange } from "../../lib/logbook/logbookFormat";
import { tripKm } from "../../lib/logbook/logbookLogic";
import type { Trip, Vehicle } from "../../lib/logbook/logbookTypes";
import { SOFT_SPRING } from "../../lib/motion/presets";
import type { LogbookTexts } from "../../texts/logbook/logbookTexts";
import GlassChip from "../glass/GlassChip";
import { KIND_STYLE } from "./logbookStyles";
import TripDetails from "./TripDetails";

interface TripCardProps {
  trip: Trip;
  vehicle?: Vehicle;
  t: LogbookTexts;
  expanded: boolean;
  locked: boolean;
  incomplete: boolean;
  onToggle: (id: string) => void;
  onEdit: (trip: Trip) => void;
  onReturn: (trip: Trip) => void;
  onDelete: (trip: Trip) => void;
}

/** Eine Fahrt als Zeile im Tagesblock: Farbbalken der Art, Uhrzeit, Strecke von → nach, Zweck, rechts die km. */
export default function TripCard({ trip, vehicle, t, expanded, locked, incomplete, onToggle, onEdit, onReturn, onDelete }: TripCardProps) {
  const style = KIND_STYLE[trip.kind];
  const places = [trip.from, trip.to].filter(Boolean);
  return (
    <motion.li layout="position" transition={SOFT_SPRING} className="list-none">
      <button
        type="button"
        aria-expanded={expanded}
        aria-label={`${timeRange(trip.startTime, trip.endTime)} ${t.kindsLong[trip.kind]}, ${formatKm(tripKm(trip), t)} – ${expanded ? t.collapse : t.expand}`}
        onClick={() => onToggle(trip.id)}
        className="relative flex w-full items-start gap-3 py-3 pl-4 pr-4 text-left transition-colors duration-200 hover:bg-[var(--glass-hover)] focus:outline-none focus-visible:bg-[var(--glass-hover)]"
      >
        <span aria-hidden className={cn("mt-1 h-9 w-1 shrink-0 rounded-full", style.bar)} />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5 text-[12px] font-medium tabular-nums text-muted-foreground">
            <span className={cn("font-semibold", style.text)}>{t.kinds[trip.kind]}</span>
            {timeRange(trip.startTime, trip.endTime) && <span>· {timeRange(trip.startTime, trip.endTime)}</span>}
          </span>
          <span className="mt-0.5 flex min-w-0 items-center gap-1.5 text-[15px] font-semibold tracking-[-0.01em] text-foreground">
            {places.length === 0 && <span className="truncate text-muted-foreground">{t.noPlace}</span>}
            {places.map((place, i) => (
              <span key={i} className="flex min-w-0 items-center gap-1.5">
                {i > 0 && <ArrowRight aria-hidden className="h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-white/35" />}
                <span className="truncate">{place}</span>
              </span>
            ))}
          </span>
          <span className="mt-1 flex flex-wrap items-center gap-1.5 text-[12.5px] text-muted-foreground">
            {trip.purpose && <span className="truncate">{trip.purpose}</span>}
            {incomplete && <GlassChip tone="amber">{t.issueTitle.missing}</GlassChip>}
            {trip.revisions.length > 0 && <GlassChip tone="slate">{t.edited(trip.revisions.length)}</GlassChip>}
            {trip.source !== "manual" && <GlassChip tone="slate">{trip.source === "v1" ? t.fromV1 : t.fromGap}</GlassChip>}
          </span>
        </span>
        <span className="shrink-0 pt-0.5 text-right">
          <span className="block text-[15px] font-semibold tabular-nums text-foreground">{formatKm(tripKm(trip), t)}</span>
          <ChevronDown aria-hidden className={cn("ml-auto mt-1 h-4 w-4 text-slate-400 transition-transform duration-300 dark:text-white/35", expanded && "rotate-180")} />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div key="details" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={SOFT_SPRING} className="overflow-hidden">
            <TripDetails trip={trip} vehicle={vehicle} t={t} locked={locked} onEdit={() => onEdit(trip)} onReturn={() => onReturn(trip)} onDelete={() => onDelete(trip)} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}
