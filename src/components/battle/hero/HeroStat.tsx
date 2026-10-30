import { Flame } from "lucide-react";
import { cn } from "../../../lib/cn";
import GlassNumber from "../../glass/GlassNumber";

interface HeroStatProps {
  label: string;
  value: number;
  /** Roter Live-Punkt neben der Zahl. */
  live?: boolean;
  /** Flackernde Flamme neben der Zahl (Siegesserie). */
  flame?: boolean;
}

/** Kennzahl unten auf der Kopfkarte: kleine Versalien, darunter die Zahl, die hochzählt. */
export default function HeroStat({ label, value, live = false, flame = false }: HeroStatProps) {
  return (
    <div className="min-w-0">
      <p className="truncate text-[10.5px] font-semibold uppercase tracking-[0.16em] text-white/50">{label}</p>
      <p className="mt-1.5 flex items-center gap-1.5 text-[24px] font-semibold leading-none tracking-[-0.02em] text-white">
        <GlassNumber value={value} duration={0.9} />
        {live && (
          <span aria-hidden className="relative flex h-2 w-2">
            <span className="arena-ping absolute inset-0 rounded-full bg-red-400" />
            <span className="relative h-2 w-2 rounded-full bg-red-400" />
          </span>
        )}
        {flame && <Flame aria-hidden className={cn("arena-flame h-5 w-5 fill-amber-300 text-orange-500")} />}
      </p>
    </div>
  );
}
