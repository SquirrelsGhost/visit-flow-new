import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

interface MapSaleHeaderProps {
  title: string;
  icon: ReactNode;
  color: string;
  onBack: () => void;
}

/** Kopf der Unterseiten im Verkauf (Tarife, Rückfragen): Zurück zum Warenkorb. */
export default function MapSaleHeader({ title, icon, color, onBack }: MapSaleHeaderProps) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <button
        type="button"
        aria-label="Zurück"
        onClick={onBack}
        className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-600 transition active:scale-95 dark:bg-white/10 dark:text-white/80"
      >
        <ChevronLeft size={18} />
      </button>
      <span className="grid h-9 w-9 place-items-center rounded-xl text-lg text-white" style={{ background: color }}>
        {icon}
      </span>
      <div className="text-lg font-extrabold text-slate-900 dark:text-white">{title}</div>
    </div>
  );
}
