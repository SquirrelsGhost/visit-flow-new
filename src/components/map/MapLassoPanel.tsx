import { AlertTriangle, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { LassoStats } from "../../lib/map/lassoStats";
import type { MapArea, TeamMemberOption } from "../../lib/map/mapTypes";
import { SOFT_SPRING } from "../../lib/motion/presets";
import type { useLassoEditor } from "../../hooks/useLassoEditor";
import MapLassoMemberPicker from "./lasso/MapLassoMemberPicker";
import MapLassoToolbar from "./lasso/MapLassoToolbar";

interface MapLassoPanelProps {
  isOpen: boolean;
  editingArea: MapArea | null;
  lasso: ReturnType<typeof useLassoEditor>;
  stats: LassoStats;
  members: TeamMemberOption[];
  selectedMember: TeamMemberOption | null;
  onSelectMember: (member: TeamMemberOption | null) => void;
  onSave: () => void;
  onClose: () => void;
}

function hint(freehand: boolean, count: number): string {
  if (freehand) return "Mit dem Finger um das Gebiet fahren. Beim Loslassen entstehen die Eckpunkte.";
  if (count === 0) return "Auf die Karte tippen, um Eckpunkte zu setzen, oder Freihand zeichnen.";
  if (count < 3) return `Noch ${3 - count} Punkt${count === 2 ? "" : "e"}, dann ist das Revier geschlossen.`;
  return "Punkte ziehen zum Verschieben, „+“ auf einer Kante fügt einen Punkt ein, Punkt antippen und Radierer löscht ihn.";
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-lg bg-[var(--glass-press)] px-2 py-1 text-[11px] text-slate-600 dark:text-white/60">
      <b className="font-extrabold tabular-nums text-slate-900 dark:text-white">{value}</b> {label}
    </span>
  );
}

/** Lasso Gebiets-Planer (v1 TrackingMap) als Glas-Panel: Werkzeuge, Live-Zahlen, Zuweisen, Speichern. */
export default function MapLassoPanel({
  isOpen,
  editingArea,
  lasso,
  stats,
  members,
  selectedMember,
  onSelectMember,
  onSave,
  onClose,
}: MapLassoPanelProps) {
  const count = lasso.points.length;
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -16, scale: 0.98, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -12, scale: 0.98, filter: "blur(6px)" }}
          transition={SOFT_SPRING}
          className="glass-surface glass-blur absolute left-3 right-3 top-[68px] z-30 mx-auto flex max-w-md flex-col gap-2 rounded-[24px] p-2.5"
        >
          <div className="flex items-center gap-2 pl-1">
            <span className="relative grid h-2.5 w-2.5 place-items-center">
              <span className="absolute h-full w-full animate-ping rounded-full bg-violet-500/60 motion-reduce:animate-none" />
              <span className="h-2 w-2 rounded-full bg-violet-500" />
            </span>
            <span className="text-sm font-extrabold text-slate-900 dark:text-white">
              {editingArea ? `Revier bearbeiten · ${editingArea.name}` : "Revier zeichnen"}
            </span>
            <button type="button" aria-label="Lasso schließen" onClick={onClose} className="ml-auto grid h-7 w-7 place-items-center rounded-xl text-slate-500 transition hover:bg-white/60 dark:text-white/60 dark:hover:bg-white/10">
              <X size={16} />
            </button>
          </div>

          <MapLassoToolbar
            freehand={lasso.freehand}
            onFreehand={lasso.setFreehand}
            canUndo={lasso.canUndo}
            canRedo={lasso.canRedo}
            hasSelection={lasso.selected !== null}
            hasPoints={count > 0}
            onUndo={lasso.undo}
            onRedo={lasso.redo}
            onRemoveSelected={lasso.removeSelected}
            onClear={lasso.clear}
          />

          <div className="flex flex-wrap gap-1.5">
            <Stat label={count === 1 ? "Punkt" : "Punkte"} value={String(count)} />
            {stats.area && <Stat label="Fläche" value={stats.area} />}
            {stats.area && <Stat label={stats.houses === 1 ? "Haus drin" : "Häuser drin"} value={String(stats.houses)} />}
          </div>

          <p className="px-0.5 text-[11px] leading-snug text-slate-600 dark:text-white/60">{hint(lasso.freehand, count)}</p>
          {stats.crosses && (
            <p className="flex items-center gap-1.5 rounded-xl bg-amber-500/15 px-2.5 py-1.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
              <AlertTriangle size={13} /> Linien kreuzen sich. Punkt verschieben, damit das Revier eine saubere Fläche ist.
            </p>
          )}

          <div className="relative z-50 flex items-center gap-2">
            <MapLassoMemberPicker members={members} selected={selectedMember} onSelect={onSelectMember} />
            <button
              type="button"
              disabled={count < 3 || !selectedMember}
              onClick={onSave}
              className="h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 px-4 text-xs font-bold text-white shadow-lg shadow-violet-700/30 transition active:scale-95 disabled:opacity-40 disabled:shadow-none"
            >
              Speichern
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
