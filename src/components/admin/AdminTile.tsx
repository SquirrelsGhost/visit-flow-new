import type { GlassNumberKind } from "../../lib/glass/glassNumber";
import { cn } from "../../lib/cn";
import GlassNumber from "../glass/GlassNumber";
import { GLASS_INSET } from "../glass/glassStyles";

interface AdminTileProps {
  label: string;
  value: number;
  kind?: GlassNumberKind;
  /** Rot, sobald größer als 0 (Stornos, Ausfälle, Sperren). */
  warn?: boolean;
}

/** Kleine eingelassene Kennzahl innerhalb einer Karte. */
export default function AdminTile({ label, value, kind = "int", warn = false }: AdminTileProps) {
  return (
    <div className={cn(GLASS_INSET, "min-w-0 px-3 py-2.5")}>
      <p className="truncate text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[var(--glass-label)]">{label}</p>
      <p className={cn("mt-1 text-[19px] font-semibold leading-none tracking-[-0.02em]", warn && value > 0 ? "text-red-600 dark:text-red-400" : "text-foreground")}>
        <GlassNumber value={value} kind={kind} />
      </p>
    </div>
  );
}
