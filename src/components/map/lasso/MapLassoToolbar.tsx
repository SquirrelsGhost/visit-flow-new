import { Eraser, PenLine, Redo2, Trash2, Undo2, MousePointerClick } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../../../lib/cn";

interface MapLassoToolbarProps {
  freehand: boolean;
  onFreehand: (on: boolean) => void;
  canUndo: boolean;
  canRedo: boolean;
  hasSelection: boolean;
  hasPoints: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onRemoveSelected: () => void;
  onClear: () => void;
}

function Tool({ label, onClick, disabled, active, danger, children }: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "grid h-9 w-9 place-items-center rounded-xl transition-all duration-200 active:scale-90 disabled:opacity-30",
        active ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30" : "bg-[var(--glass-press)] text-slate-700 hover:bg-[var(--glass-hover)] dark:text-white/85",
        danger && !active && "text-red-500 dark:text-red-400",
      )}
    >
      {children}
    </button>
  );
}

/** Werkzeuge des Lassos: Tippen/Freihand, Rückgängig, Wiederholen, Punkt löschen, alles löschen. */
export default function MapLassoToolbar(p: MapLassoToolbarProps) {
  return (
    <div className="flex items-center gap-1.5">
      <Tool label="Punkte setzen" active={!p.freehand} onClick={() => p.onFreehand(false)}>
        <MousePointerClick size={16} />
      </Tool>
      <Tool label="Freihand zeichnen" active={p.freehand} onClick={() => p.onFreehand(true)}>
        <PenLine size={16} />
      </Tool>
      <span className="mx-1 h-6 w-px bg-slate-300/70 dark:bg-white/15" />
      <Tool label="Rückgängig" disabled={!p.canUndo} onClick={p.onUndo}>
        <Undo2 size={16} />
      </Tool>
      <Tool label="Wiederholen" disabled={!p.canRedo} onClick={p.onRedo}>
        <Redo2 size={16} />
      </Tool>
      <span className="flex-1" />
      <Tool label="Gewählten Punkt löschen" danger disabled={!p.hasSelection} onClick={p.onRemoveSelected}>
        <Eraser size={16} />
      </Tool>
      <Tool label="Alle Punkte löschen" danger disabled={!p.hasPoints} onClick={p.onClear}>
        <Trash2 size={16} />
      </Tool>
    </div>
  );
}
