// Braucht useState für das Auf-/Zuklappen des Gebiets-Menüs
"use client";

import { useState } from "react";
import type { MapArea } from "../../lib/map/mapTypes";

interface MapAreaDropdownProps {
  areas: MapArea[];
  selectedArea: MapArea | null;
  onSelectArea: (area: MapArea | null) => void;
}

/** Live-Status-Pill links oben mit Gebiets-Auswahl (aus v1 TrackingMap). */
export default function MapAreaDropdown({ areas, selectedArea, onSelectArea }: MapAreaDropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="pointer-events-auto relative">
      <button
        type="button"
        onClick={() => setOpen((cur) => !cur)}
        className="glass-surface glass-blur flex h-[42px] min-w-[74px] max-w-[150px] items-center justify-center gap-1.5 rounded-full px-3.5 text-xs font-semibold text-slate-800 transition-all hover:bg-white active:scale-95 dark:text-white dark:hover:bg-black/75"
      >
        <span
          className={`inline-block h-2 w-2 rounded-full ${
            selectedArea ? "bg-purple-500" : "animate-pulse bg-emerald-400"
          }`}
        />
        <span className="truncate">{selectedArea ? selectedArea.name : "Live"}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="glass-surface glass-blur absolute left-0 top-full z-50 mt-1 max-h-56 w-52 divide-y divide-slate-100 overflow-y-auto rounded-[24px] py-1 dark:divide-slate-800/60">
            <button
              type="button"
              onClick={() => {
                onSelectArea(null);
                setOpen(false);
              }}
              className="flex w-full items-center gap-1.5 px-3.5 py-2 text-left text-xs font-medium text-slate-500 transition-colors hover:bg-purple-50 dark:text-slate-400 dark:hover:bg-purple-950/20"
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              Live-Ansicht (Reset)
            </button>
            {areas.length === 0 ? (
              <div className="p-3 text-center text-[11px] text-slate-400">Keine Gebiete vorhanden</div>
            ) : (
              areas.map((area) => (
                <button
                  key={area.id}
                  type="button"
                  onClick={() => {
                    onSelectArea(area);
                    setOpen(false);
                  }}
                  className={`flex w-full flex-col gap-0.5 px-3.5 py-2.5 text-left text-xs transition-colors hover:bg-purple-50 dark:hover:bg-purple-950/20 ${
                    selectedArea?.id === area.id ? "bg-purple-50 font-bold dark:bg-purple-950/10" : ""
                  }`}
                >
                  <span className="w-full truncate text-slate-800 dark:text-white">{area.name}</span>
                  {area.description && (
                    <span className="w-full truncate text-[9px] text-slate-400 dark:text-slate-500">
                      {area.description}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
