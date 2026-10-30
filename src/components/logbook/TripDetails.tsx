import { Car, Gauge, History, Pencil, Repeat, Target, Trash2, Users, type LucideIcon } from "lucide-react";
import { cn } from "../../lib/cn";
import { describeChange } from "../../lib/logbook/logbookExport";
import { formatDateTime, formatKm, formatNumber } from "../../lib/logbook/logbookFormat";
import { tripKm } from "../../lib/logbook/logbookLogic";
import type { Trip, Vehicle } from "../../lib/logbook/logbookTypes";
import type { LogbookTexts } from "../../texts/logbook/logbookTexts";
import { GLASS_INSET } from "../glass/glassStyles";
import { FACT, FACT_LABEL, SOFT_BUTTON, SOFT_NEUTRAL } from "./logbookStyles";

interface TripDetailsProps {
  trip: Trip;
  vehicle?: Vehicle;
  t: LogbookTexts;
  locked: boolean;
  onEdit: () => void;
  onReturn: () => void;
  onDelete: () => void;
}

function Fact({ icon: Icon, label, value, wide }: { icon: LucideIcon; label: string; value: string; wide?: boolean }) {
  return (
    <p className={cn(FACT, wide && "col-span-2")}>
      <Icon aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-white/40" />
      <span className="min-w-0">
        <span className={FACT_LABEL}>{label}</span>
        <span className="block break-words font-medium tabular-nums text-foreground">{value || "–"}</span>
      </span>
    </p>
  );
}

/** Aufgeklappte Fahrt: alle Pflichtangaben, Fahrzeug, Erfassung und Änderungsprotokoll, darunter die Aktionen. */
export default function TripDetails({ trip, vehicle, t, locked, onEdit, onReturn, onDelete }: TripDetailsProps) {
  const car = vehicle ? [vehicle.name || t.vehicleUnnamed, vehicle.plate].filter(Boolean).join(" · ") : "";
  return (
    <div className="space-y-3 px-4 pb-4 pl-8">
      <div className="grid grid-cols-2 gap-3">
        <Fact icon={Gauge} label={t.distance} value={`${formatNumber(trip.startKm, t)} → ${formatNumber(trip.endKm, t)} · ${formatKm(tripKm(trip), t)}`} wide />
        {(trip.kind === "business" || trip.purpose) && <Fact icon={Target} label={t.field.purpose} value={trip.purpose} />}
        {(trip.kind === "business" || trip.partner) && <Fact icon={Users} label={t.field.partner} value={trip.partner} />}
        {trip.detour && <Fact icon={Repeat} label={t.field.detour} value={trip.detour} wide />}
        <Fact icon={Car} label={t.field.vehicleId} value={car} />
        <Fact icon={History} label={t.createdAt} value={`${formatDateTime(trip.createdAt, t)}${trip.driver ? ` · ${trip.driver}` : ""}`} />
      </div>
      {trip.revisions.length > 0 && (
        <div className={cn(GLASS_INSET, "px-3.5 py-2.5")}>
          <span className={FACT_LABEL}>{t.history}</span>
          <ul className="mt-1 space-y-0.5 text-[12.5px] text-muted-foreground">
            {trip.revisions.map((r, i) => (
              <li key={r.at}>{t.historyLine(formatDateTime(r.at, t), describeChange(r.before, i + 1 < trip.revisions.length ? trip.revisions[i + 1]!.before : trip, t))}</li>
            ))}
          </ul>
        </div>
      )}
      {locked ? (
        <p className="text-[12.5px] leading-snug text-muted-foreground">{t.lockedNote}</p>
      ) : (
        <div className="flex gap-2">
          <button type="button" onClick={onEdit} className={cn(SOFT_BUTTON, SOFT_NEUTRAL, "flex-1")}>
            <Pencil aria-hidden className="h-4 w-4" />
            {t.editTrip}
          </button>
          <button type="button" onClick={onReturn} className={cn(SOFT_BUTTON, "flex-1 bg-blue-500/10 text-blue-700 hover:bg-blue-500/15 dark:text-sky-300")}>
            <Repeat aria-hidden className="h-4 w-4" />
            {t.returnTrip}
          </button>
          <button type="button" onClick={onDelete} aria-label={t.deleteTrip} className={cn(SOFT_BUTTON, "bg-red-500/10 text-red-600 hover:bg-red-500/15 dark:text-red-300")}>
            <Trash2 aria-hidden className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
