// Braucht useState für Partei-Wahl, Notiz, Familienname und Hausnummer-Korrektur
"use client";

import { MessageSquarePlus, Pencil, User, X } from "lucide-react";
import { useState } from "react";
import { useLastDefined } from "../../hooks/useLastDefined";
import type { Vertical } from "../../lib/battle/battleCategories";
import { colorForStatus, MAP_STATUSES, PREDEFINED_UNITS, statusLabel, type MapHouse, type VisitStatus } from "../../lib/map/mapTypes";
import MapHouseUnits from "./MapHouseUnits";
import MapSheet from "./MapSheet";
import MapStatusIcon from "./MapStatusIcon";

interface MapHouseSheetProps {
  house: MapHouse | null;
  vertical: Vertical;
  onClose: () => void;
  onUpdateStatus: (houseId: string, status: VisitStatus, unit: string | null, comment: string) => void;
  onSaveFamilyName: (houseId: string, familyName: string) => void;
  onFixHouseNumber: (houseId: string, houseNumber: string) => void;
}

const SHEET_STATUSES = MAP_STATUSES.filter((s) => s.key !== "Approved" && s.key !== "Storno");
const ACTION_BTN =
  "flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 bg-slate-50 py-2.5 text-xs font-semibold text-slate-600 dark:border-white/15 dark:bg-white/5 dark:text-white/70";

/** Bottom-Sheet für ein bestehendes Haus (2-Tap-Erfassung, MFH-Parteien, Name & Hausnr. aus v1). */
export default function MapHouseSheet({
  house: currentHouse,
  vertical,
  onClose,
  onUpdateStatus,
  onSaveFamilyName,
  onFixHouseNumber,
}: MapHouseSheetProps) {
  const [selectedUnit, setSelectedUnit] = useState<string>(PREDEFINED_UNITS[0]!);
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState("");
  const [showName, setShowName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [showFix, setShowFix] = useState(false);
  const [fixNr, setFixNr] = useState("");

  const house = useLastDefined(currentHouse);
  if (!house) return null;

  const extraUnits = house.doors.map((d) => d.name).filter((n) => n && !PREDEFINED_UNITS.includes(n));
  const unitList = [...PREDEFINED_UNITS, ...extraUnits];
  const gridStatus =
    house.type === "MFH" ? (house.doors.find((d) => d.name === selectedUnit)?.status ?? "offen") : house.status;
  const headerColor = colorForStatus(house.status);

  return (
    <MapSheet open={Boolean(currentHouse)} onClose={onClose}>
        <div className="mb-3 flex flex-shrink-0 items-start gap-2">
          <div>
            <div className="text-xl font-extrabold leading-tight text-slate-900 dark:text-white">
              {house.street ? `${house.street} ${house.houseNumber}` : `Hausnr. ${house.houseNumber}`}
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-white/50">
              <span>{house.type === "MFH" ? "Mehrfamilienhaus" : "Einfamilienhaus"}</span>
              {house.familyName && (
                <>
                  <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-white/20" />
                  <span className="font-semibold text-slate-700 dark:text-white/80">Familie: {house.familyName}</span>
                </>
              )}
            </div>
          </div>
          <span
            className="ml-auto flex-shrink-0 rounded-md px-2 py-1 text-[10px] font-bold"
            style={{ background: `${headerColor}22`, color: headerColor }}
          >
            {statusLabel(house.status, vertical)}
          </span>
          <button type="button" onClick={onClose} className="ml-1 p-1 text-slate-500 dark:text-white/50">
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pb-4 pr-1">
          {house.type === "MFH" && (
            <MapHouseUnits
              doors={house.doors}
              unitList={unitList}
              selectedUnit={selectedUnit}
              onSelectUnit={setSelectedUnit}
            />
          )}

          <div className="grid grid-cols-3 gap-2">
            {SHEET_STATUSES.map(({ key, color }) => (
              <button
                key={key}
                type="button"
                onClick={() => onUpdateStatus(house.id, key, house.type === "MFH" ? selectedUnit : null, note)}
                className={`flex min-h-[72px] flex-col items-center justify-center gap-1.5 rounded-2xl border px-1 py-3 transition active:scale-95 ${
                  gridStatus === key
                    ? "border-slate-900 bg-slate-900/10 dark:border-white dark:bg-white/10"
                    : "border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-[#121a2b]"
                }`}
              >
                <span className="grid h-8 w-8 place-items-center rounded-xl text-white" style={{ background: color }}>
                  <MapStatusIcon status={key} vertical={vertical} size={17} />
                </span>
                <span className="text-center text-[11px] font-semibold leading-tight text-slate-900 dark:text-white">
                  {statusLabel(key, vertical)}
                </span>
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={() => setShowNote((v) => !v)} className={ACTION_BTN}>
              <MessageSquarePlus size={15} /> Notiz
            </button>
            {house.type === "EFH" && (
              <button type="button" onClick={() => { setNameInput(house.familyName ?? ""); setShowName((v) => !v); }} className={ACTION_BTN}>
                <User size={15} /> Name
              </button>
            )}
            <button type="button" onClick={() => { setFixNr(house.houseNumber); setShowFix((v) => !v); }} className={ACTION_BTN}>
              <Pencil size={15} /> {house.type === "EFH" ? "Hausnr." : "Hausnr. korrigieren"}
            </button>
          </div>

          {showNote && (
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Notiz fürs Team (optional)…" className="w-full rounded-xl border border-slate-300 bg-slate-100 p-2.5 text-sm text-slate-900 outline-none dark:border-white/10 dark:bg-[#0a0f1a] dark:text-white" />
          )}
          {showName && (
            <div className="flex gap-2">
              <input value={nameInput} onChange={(e) => setNameInput(e.target.value)} placeholder="Name der Familie..." className="flex-1 rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-900 outline-none dark:border-white/10 dark:bg-[#0a0f1a] dark:text-white" />
              <button type="button" onClick={() => { onSaveFamilyName(house.id, nameInput.trim()); setShowName(false); }} className="rounded-xl bg-blue-600 px-4 text-sm font-bold text-white active:scale-95">Speichern</button>
            </div>
          )}
          {showFix && (
            <div className="flex gap-2">
              <input value={fixNr} onChange={(e) => setFixNr(e.target.value)} placeholder="Richtige Hausnr." className="flex-1 rounded-xl border border-amber-400 bg-amber-50 px-3 py-2 text-sm text-slate-900 outline-none dark:border-amber-500/40 dark:bg-[#0a0f1a] dark:text-white" />
              <button type="button" onClick={() => { if (fixNr.trim()) onFixHouseNumber(house.id, fixNr.trim()); setShowFix(false); }} className="rounded-xl bg-red-600 px-4 text-sm font-bold text-white active:scale-95">Speichern</button>
            </div>
          )}
        </div>
    </MapSheet>
  );
}
