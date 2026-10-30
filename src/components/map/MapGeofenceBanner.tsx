import { AlertTriangle, ShieldAlert } from "lucide-react";
import type { GeofenceState } from "../../lib/map/mapTypes";

interface MapGeofenceBannerProps {
  geofence: GeofenceState;
  dismissedStatus: string | null;
  onDismiss: (status: string) => void;
}

/** Geofence-Warnbanner aus v1 TrackingMap (Revier-Konflikt oder außerhalb eigener Reviere). */
export default function MapGeofenceBanner({ geofence, dismissedStatus, onDismiss }: MapGeofenceBannerProps) {
  if (
    geofence.status === "unknown" ||
    geofence.status === "inside_own" ||
    geofence.status === dismissedStatus
  ) {
    return null;
  }

  const isConflict = geofence.status === "inside_other";

  return (
    <div
      className={`absolute left-3 right-3 top-16 z-30 flex items-center justify-between rounded-2xl border p-3 shadow-xl backdrop-blur-md transition-all duration-300 ${
        isConflict
          ? "border-red-400/30 bg-red-500/90 text-white dark:bg-red-950/85"
          : "border-amber-400/20 bg-amber-500/85 text-white dark:bg-amber-950/80"
      }`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        {isConflict ? (
          <ShieldAlert className="h-4 w-4 flex-shrink-0 animate-pulse text-yellow-200" />
        ) : (
          <AlertTriangle className="h-4 w-4 flex-shrink-0 text-amber-100" />
        )}
        <div className="truncate text-xs font-semibold leading-tight">
          {isConflict ? (
            <>
              ⚠️ Revier-Konflikt! Du bist im Revier von{" "}
              <b className="underline decoration-2">{geofence.managerName}</b> ({geofence.areaName})
            </>
          ) : (
            <>⚠️ Achtung: Du arbeitest außerhalb deiner Reviere</>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={() => onDismiss(geofence.status)}
        className="ml-3 flex-shrink-0 rounded-lg bg-white/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white transition-all hover:bg-white/30 active:scale-95"
      >
        Ausblenden
      </button>
    </div>
  );
}
