import { CarFront } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../../lib/cn";
import { formatKm, formatShortDate, weekdayOf } from "../../lib/logbook/logbookFormat";
import { groupByDay } from "../../lib/logbook/logbookLogic";
import type { Trip, Vehicle } from "../../lib/logbook/logbookTypes";
import { riseIn } from "../../lib/motion/presets";
import type { LogbookTexts } from "../../texts/logbook/logbookTexts";
import GlassRow from "../glass/GlassRow";
import GlassSection from "../glass/GlassSection";
import { GLASS_CARD, GLASS_DIVIDER, GLASS_LABEL } from "../glass/glassStyles";
import TripCard from "./TripCard";

interface TripListProps {
  t: LogbookTexts;
  trips: readonly Trip[];
  vehicles: readonly Vehicle[];
  locked: boolean;
  /** Fahrten mit fehlenden Pflichtangaben (aus dem Finanzamt-Check). */
  incompleteIds: ReadonlySet<string>;
  expandedId: string | null;
  onToggle: (id: string) => void;
  onEdit: (trip: Trip) => void;
  onReturn: (trip: Trip) => void;
  onDelete: (trip: Trip) => void;
  onNew: () => void;
}

/** Fahrten des Monats nach Tagen, neuester Tag oben; jeder Tag eine Glaskarte mit Tageskilometern in der Überschrift. */
export default function TripList({ t, trips, vehicles, locked, incompleteIds, expandedId, onToggle, onEdit, onReturn, onDelete, onNew }: TripListProps) {
  const days = groupByDay(trips);
  return (
    <section aria-label={t.list} className="space-y-5">
      <motion.h3 variants={riseIn} className={cn(GLASS_LABEL, "flex justify-between pb-0")}>
        <span>{t.list}</span>
        <span className="tabular-nums">{t.listCount(trips.length)}</span>
      </motion.h3>
      {days.length === 0 && (
        <GlassSection footer={t.emptyHint}>
          <GlassRow icon={CarFront} tone="blue" title={t.empty} subtitle={locked ? t.lockedNote : undefined} onClick={locked ? undefined : onNew} />
        </GlassSection>
      )}
      {days.map((day) => (
        <motion.div key={day.date} variants={riseIn}>
          <h4 className={cn(GLASS_LABEL, "normal-case tracking-[0.04em] text-[12px]")}>{t.dayHeader(weekdayOf(day.date, t), formatShortDate(day.date, t), formatKm(day.km, t))}</h4>
          <ul className={cn(GLASS_CARD, GLASS_DIVIDER, "[&>*+*]:before:left-8")}>
            {day.trips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                vehicle={vehicles.find((v) => v.id === trip.vehicleId)}
                t={t}
                expanded={expandedId === trip.id}
                locked={locked}
                incomplete={incompleteIds.has(trip.id)}
                onToggle={onToggle}
                onEdit={onEdit}
                onReturn={onReturn}
                onDelete={onDelete}
              />
            ))}
          </ul>
        </motion.div>
      ))}
    </section>
  );
}
