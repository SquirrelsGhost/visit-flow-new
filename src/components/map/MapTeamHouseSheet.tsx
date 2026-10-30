import { Users, X } from "lucide-react";
import { useLastDefined } from "../../hooks/useLastDefined";
import type { Vertical } from "../../lib/battle/battleCategories";
import { isRecentEdit, type TeamHouse } from "../../lib/map/mapTeam";
import { colorForStatus, relTime, statusLabel } from "../../lib/map/mapTypes";
import MapSheet from "./MapSheet";

interface MapTeamHouseSheetProps {
  house: TeamHouse | null;
  vertical: Vertical;
  onClose: () => void;
}

/** Nur-Ansicht für ein Haus, das ein Kollege bearbeitet hat (v1 TrackingMap "Team-Transparenz"). */
export default function MapTeamHouseSheet({ house: currentHouse, vertical, onClose }: MapTeamHouseSheetProps) {
  const house = useLastDefined(currentHouse);
  if (!house) return null;

  const color = colorForStatus(house.status);
  const isRecent = isRecentEdit(house.ts);

  return (
    <MapSheet open={Boolean(currentHouse)} onClose={onClose}>
      <div className="mb-2 flex flex-shrink-0 items-start gap-2">
        <div>
          <div className="text-xl font-extrabold leading-tight text-slate-900 dark:text-white">
            {house.street} {house.number}
          </div>
          <div className="text-xs text-slate-500 dark:text-white/50">Team · nur Ansicht</div>
        </div>
        <span
          className="ml-auto flex-shrink-0 rounded-md px-2 py-1 text-[10px] font-bold"
          style={{ background: `${color}22`, color }}
        >
          {statusLabel(house.status, vertical)}
        </span>
        <button type="button" aria-label="Schließen" onClick={onClose} className="ml-1 p-1 text-slate-500 dark:text-white/50">
          <X size={18} />
        </button>
      </div>
      <div className="flex flex-shrink-0 items-center gap-2 text-sm text-slate-700 dark:text-white/80">
        <Users size={15} /> Bearbeitet von <b className="font-bold text-slate-900 dark:text-white">{house.by}</b>
        {isRecent && (
          <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-bold text-red-500 dark:text-red-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500 motion-reduce:animate-none" /> gerade dran
          </span>
        )}
      </div>
      {house.ts > 0 && <div className="mt-1 pb-2 text-[11px] text-slate-500 dark:text-white/40">{relTime(house.ts)}</div>}
    </MapSheet>
  );
}
