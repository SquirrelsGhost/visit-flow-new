import { cn } from "../../lib/cn";
import { CARD } from "./abrechnungStyles";

interface AbrechnungSkeletonProps {
  className?: string;
}

/** Platzhalter, solange der Monat lädt: gleiche Form wie die Übersicht, damit nichts springt. */
export default function AbrechnungSkeleton({ className }: AbrechnungSkeletonProps) {
  return (
    <div className={cn(CARD, "space-y-4 p-5", className)} aria-busy="true" aria-label="Lädt">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2.5">
          <div className="h-3.5 w-36 animate-pulse rounded-full bg-slate-200/80 dark:bg-white/[0.06]" />
          <div className="h-9 w-48 animate-pulse rounded-xl bg-slate-200/80 dark:bg-white/[0.06]" />
          <div className="h-5 w-56 animate-pulse rounded-full bg-slate-100 dark:bg-white/[0.04]" />
        </div>
        <div className="h-[88px] w-[88px] animate-pulse rounded-full bg-slate-100 dark:bg-white/[0.04]" />
      </div>
      <div className="h-24 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/[0.04]" />
    </div>
  );
}
