import { ChevronLeft, Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import FadeSwap from "../../ui/FadeSwap";

interface MapStepFrameProps {
  title: string;
  /** Statusfarbe: Akzent oben und Speichern-Knopf. */
  color: string;
  icon: ReactNode;
  saving: boolean;
  canSave?: boolean;
  saveLabel?: string;
  onBack: () => void;
  onSave: () => void;
  children: ReactNode;
}

/** Rahmen eines Status-Schritts im Sheet: Zurück, Titel, Inhalt, Speichern (ersetzt v1-Dialoge). */
export default function MapStepFrame({
  title,
  color,
  icon,
  saving,
  canSave = true,
  saveLabel = "Speichern",
  onBack,
  onSave,
  children,
}: MapStepFrameProps) {
  return (
    <FadeSwap>
      <div className="mb-3 flex items-center gap-2">
        <button
          type="button"
          aria-label="Zurück"
          onClick={onBack}
          className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-600 transition active:scale-95 dark:bg-white/10 dark:text-white/80"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="grid h-9 w-9 place-items-center rounded-xl text-white" style={{ background: color }}>
          {icon}
        </span>
        <div className="text-lg font-extrabold text-slate-900 dark:text-white">{title}</div>
      </div>
      <div className="space-y-4 pb-2">{children}</div>
      <button
        type="button"
        disabled={saving || !canSave}
        onClick={onSave}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-white shadow-lg transition active:scale-[0.98] disabled:opacity-50"
        style={{ background: color }}
      >
        {saving && <Loader2 size={16} className="animate-spin" />}
        {saveLabel}
      </button>
    </FadeSwap>
  );
}
