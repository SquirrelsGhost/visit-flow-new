// Monat, Sheets und Aufklappen leben im Browser
"use client";

import { useMemo, useRef, useState } from "react";
import { useLastDefined } from "../../hooks/useLastDefined";
import { useLogbook } from "../../hooks/useLogbook";
import { useLogbookMonth } from "../../hooks/useLogbookMonth";
import { useLogbookTexts } from "../../hooks/useLogbookTexts";
import { useMonthNav } from "../../hooks/useMonthNav";
import { useUserSettings } from "../../hooks/useUserSettings";
import { hasDemoSession } from "../../lib/auth/demoSession";
import { draftOf, newDraft, returnDraft, type TripDraft } from "../../lib/logbook/logbookDraft";
import { monthLabel } from "../../lib/logbook/logbookFormat";
import { currentMonth, monthKey } from "../../lib/logbook/logbookDates";
import { lastEndKm } from "../../lib/logbook/logbookLogic";
import type { LogbookIssue, Trip } from "../../lib/logbook/logbookTypes";
import GlassBody from "../glass/GlassBody";
import GlassSplit from "../glass/GlassSplit";
import DeleteTripSheet from "./DeleteTripSheet";
import ExportSheet from "./ExportSheet";
import LockSheet from "./LockSheet";
import LogbookActions from "./LogbookActions";
import LogbookChecks from "./LogbookChecks";
import LogbookHero from "./LogbookHero";
import TripList from "./TripList";
import TripSheet from "./TripSheet";
import VehicleSheet from "./VehicleSheet";

interface LogbookProps {
  userId: string;
  driver: string;
}

type Sheet = "export" | "vehicle" | "lock" | null;
interface TripForm {
  key: number;
  draft: TripDraft;
  editing?: Trip;
}

/**
 * Fahrtenbuch (v1 FahrtenbuchDialog als eigene Seite): links Kopfkarte, Aktionen und Finanzamt-Check,
 * rechts die Fahrten des Monats nach Tagen. Auf dem Handy untereinander in derselben Reihenfolge.
 */
export default function Logbook({ userId, driver }: LogbookProps) {
  const t = useLogbookTexts();
  const nav = useMonthNav();
  const lb = useLogbook(userId, driver);
  const m = useLogbookMonth(lb.data, nav.ref);
  const { settings } = useUserSettings();
  const [form, setForm] = useState<TripForm | null>(null);
  const shownForm = useLastDefined(form);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [vehicleRun, setVehicleRun] = useState(0);
  const formRun = useRef(0);
  const [deleting, setDeleting] = useState<Trip | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const label = monthLabel(nav.ref, t);
  const now = new Date();
  const isCurrent = monthKey(nav.ref) === monthKey(currentMonth(now));
  const incompleteIds = useMemo(() => new Set(m.issues.filter((i) => i.kind === "missing").map((i) => i.tripId ?? "")), [m.issues]);

  const openForm = (draft: TripDraft, editing?: Trip) => setForm({ key: ++formRun.current, draft, editing });
  const openNew = () => {
    const at = isCurrent || m.locked ? now : new Date(nav.ref.year, nav.ref.month + 1, 0, 18, 0);
    openForm(newDraft(lb.data, settings.currentKm, at));
  };
  const openIssue = (issue: LogbookIssue) => {
    const trip = lb.data.trips.find((x) => x.id === issue.tripId);
    if (trip && !m.locked && issue.kind === "missing") openForm(draftOf(trip), trip);
    else if (trip) setExpandedId(trip.id);
  };

  return (
    <>
      <GlassBody layout="wide">
        <GlassSplit
          aside={
            <>
              <LogbookHero
                t={t}
                monthLabel={label}
                dir={nav.dir}
                atLatest={nav.atLatest}
                onPrev={nav.prev}
                onNext={nav.next}
                summary={m.summary}
                yearToDate={m.yearToDate}
                bars={m.bars}
                today={isCurrent ? now.getDate() : null}
                odometer={lastEndKm(lb.data.trips, lb.data.activeVehicleId) ?? settings.currentKm}
                locked={m.locked}
                demo={hasDemoSession()}
                sync={lb.sync}
              />
              <LogbookActions t={t} locked={m.locked} onNew={openNew} onExport={() => setSheet("export")} onVehicle={() => (setVehicleRun((n) => n + 1), setSheet("vehicle"))} onLock={() => setSheet("lock")} />
              <LogbookChecks t={t} issues={m.issues} trips={m.trips} locked={m.locked} onFillGap={(issue) => lb.fillGap(issue, lb.data.activeVehicleId)} onOpen={openIssue} onLock={() => setSheet("lock")} />
            </>
          }
        >
          <TripList
            t={t}
            trips={m.trips}
            vehicles={lb.data.vehicles}
            locked={m.locked}
            incompleteIds={incompleteIds}
            expandedId={expandedId}
            onToggle={(id) => setExpandedId((cur) => (cur === id ? null : id))}
            onEdit={(trip) => openForm(draftOf(trip), trip)}
            onReturn={(trip) => openForm(returnDraft(trip))}
            onDelete={setDeleting}
            onNew={openNew}
          />
        </GlassSplit>
      </GlassBody>
      {shownForm && (
        <TripSheet
          key={shownForm.key}
          open={form !== null}
          editing={shownForm.editing}
          initial={shownForm.draft}
          data={lb.data}
          driver={driver}
          t={t}
          onClose={() => setForm(null)}
          onSave={(trip) => (lb.saveTrip(trip), setForm(null))}
        />
      )}
      <ExportSheet open={sheet === "export"} data={lb.data} month={nav.ref} monthLabel={label} openIssues={m.issues.length} driver={driver} t={t} onClose={() => setSheet(null)} />
      <VehicleSheet key={vehicleRun} open={sheet === "vehicle"} vehicles={lb.data.vehicles} activeId={lb.data.activeVehicleId} t={t} onClose={() => setSheet(null)} onSave={lb.saveVehicles} />
      <LockSheet
        open={sheet === "lock"}
        locked={m.locked}
        lock={m.lock}
        monthLabel={label}
        blocking={m.blocking}
        t={t}
        onClose={() => setSheet(null)}
        onConfirm={(reason) => (lb.setLock(m.id, !m.locked, reason, label), setSheet(null))}
      />
      <DeleteTripSheet trip={deleting} t={t} onClose={() => setDeleting(null)} onConfirm={(trip) => (lb.deleteTrip(trip.id), setDeleting(null))} />
    </>
  );
}
