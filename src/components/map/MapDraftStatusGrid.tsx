import type { Vertical } from "../../lib/battle/battleCategories";
import { colorForStatus, statusLabel, type VisitStatus } from "../../lib/map/mapTypes";
import MapStatusIcon from "./MapStatusIcon";

interface MapDraftStatusGridProps {
  vertical: Vertical;
  disabled: boolean;
  onStatus: (status: VisitStatus) => void;
}

const TOP_STATUSES: VisitStatus[] = ["Angetroffen → Termin", "Angetroffen → Versorgt", "Angetroffen → Kein Interesse"];
const MAIN_STATUSES: VisitStatus[] = ["N/A", "Angetroffen → Sale"];
const TILE =
  "flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 px-1 transition active:scale-95 disabled:opacity-50 dark:border-white/10 dark:bg-[#121a2b]";

/** Status-Kacheln im Neues-Haus-Sheet: oben drei kleine, unten die zwei Hauptaktionen (v1). Solar hat keinen Termin. */
export default function MapDraftStatusGrid({ vertical, disabled, onStatus }: MapDraftStatusGridProps) {
  const topRow = vertical === "solar" ? TOP_STATUSES.slice(1) : TOP_STATUSES;

  return (
    <>
      <div className={`grid gap-2 ${vertical === "solar" ? "grid-cols-2" : "grid-cols-3"}`}>
        {topRow.map((key) => (
          <button key={key} type="button" disabled={disabled} onClick={() => onStatus(key)} className={`${TILE} min-h-[72px] gap-1.5 py-3`}>
            <span className="grid h-8 w-8 place-items-center rounded-xl text-white" style={{ background: colorForStatus(key) }}>
              <MapStatusIcon status={key} vertical={vertical} size={17} />
            </span>
            <span className="text-center text-[11px] font-semibold leading-tight text-slate-900 dark:text-white">
              {statusLabel(key, vertical)}
            </span>
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {MAIN_STATUSES.map((key) => (
          <button key={key} type="button" disabled={disabled} onClick={() => onStatus(key)} className={`${TILE} min-h-[88px] gap-2 py-3.5`}>
            <span className="grid h-10 w-10 place-items-center rounded-xl text-white" style={{ background: colorForStatus(key) }}>
              <MapStatusIcon status={key} vertical={vertical} size={21} />
            </span>
            <span className="text-center text-sm font-bold leading-tight text-slate-900 dark:text-white">
              {statusLabel(key, vertical)}
            </span>
          </button>
        ))}
      </div>
    </>
  );
}
