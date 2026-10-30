import { colorForStatus, OFFEN_COLOR, type MapDoor } from "../../lib/map/mapTypes";

interface MapHouseUnitsProps {
  doors: MapDoor[];
  unitList: string[];
  selectedUnit: string;
  onSelectUnit: (unit: string) => void;
}

/** Partei-Auswahlleiste für Mehrfamilienhäuser (MFH) im Haus-Sheet (v1 TrackingMap). */
export default function MapHouseUnits({ doors, unitList, selectedUnit, onSelectUnit }: MapHouseUnitsProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-white/50">
          Partei wählen
        </span>
        <span className="text-[11px] font-semibold text-emerald-500">
          {doors.filter((d) => d.status !== "N/A").length}/{unitList.length} erfasst
        </span>
      </div>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {unitList.map((u) => {
          const d = doors.find((x) => x.name === u);
          return (
            <button
              key={u}
              type="button"
              onClick={() => onSelectUnit(u)}
              className={`flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                selectedUnit === u
                  ? "border-slate-900 bg-slate-900/5 text-slate-900 dark:border-white dark:bg-white/10 dark:text-white"
                  : "border-slate-200 bg-slate-100 text-slate-700 dark:border-white/10 dark:bg-[#121a2b] dark:text-white/80"
              }`}
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: d ? colorForStatus(d.status) : OFFEN_COLOR }}
              />
              {u}
            </button>
          );
        })}
      </div>
    </div>
  );
}
