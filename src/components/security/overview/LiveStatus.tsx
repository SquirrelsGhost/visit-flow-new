import { RefreshCw } from "lucide-react";
import { formatStamp, useSecurityTexts } from "../../../hooks/useSecurityTexts";
import { cn } from "../../../lib/cn";

interface LiveStatusProps {
  loadedAt: string;
  refreshing: boolean;
  onRefresh: () => void;
}

/** Pulsierender Live-Punkt mit Stand der Daten und Knopf zum Neuladen (v1 LiveIndicator + Aktualisieren). */
export default function LiveStatus({ loadedAt, refreshing, onRefresh }: LiveStatusProps) {
  const t = useSecurityTexts();
  return (
    <div className="flex items-center gap-2">
      <span className="flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-200 ring-1 ring-inset ring-emerald-300/25">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:animate-none" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
        </span>
        {t.hero.live}
      </span>
      <span className="hidden text-[12px] tabular-nums text-white/50 min-[380px]:inline">{t.hero.updated(formatStamp(t, loadedAt, false))}</span>
      <button
        type="button"
        onClick={onRefresh}
        aria-label={t.hero.refresh}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.08] text-white/80 ring-1 ring-inset ring-white/15 transition-[background-color,transform] duration-200 hover:bg-white/[0.14] active:scale-95"
      >
        <RefreshCw aria-hidden className={cn("h-3.5 w-3.5", refreshing && "animate-spin motion-reduce:animate-none")} />
      </button>
    </div>
  );
}
