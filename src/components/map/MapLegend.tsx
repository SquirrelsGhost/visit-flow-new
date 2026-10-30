import type { Vertical } from "../../lib/battle/battleCategories";
import { MAP_STATUSES, statusLabel } from "../../lib/map/mapTypes";

interface MapLegendProps {
  vertical: Vertical;
}

/** Status-Legende links unten auf der Karte (aus v1 TrackingMap). */
export default function MapLegend({ vertical }: MapLegendProps) {
  const visibleStatuses = MAP_STATUSES.filter((s) => s.key !== "Angetroffen → Termin" || vertical !== "solar");

  return (
    <div className="glass-surface glass-blur pointer-events-auto absolute bottom-4 left-3 z-10 flex flex-col gap-1 rounded-xl px-2.5 py-2">
      {visibleStatuses.map((s) => (
        <div key={s.key} className="flex items-center gap-2 text-[11px] text-slate-700 dark:text-white/90">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
          {statusLabel(s.key, vertical)}
        </div>
      ))}
      <div
        className="mt-1 border-t border-slate-200 pt-1.5 text-[10px] font-medium text-emerald-600 dark:border-white/10 dark:text-emerald-400"
        title="Kein anderes Team sieht deine Daten"
      >
        🔒 Team-isoliert
      </div>
    </div>
  );
}
