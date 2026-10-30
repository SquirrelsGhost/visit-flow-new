import type { ReactNode } from "react";
import { cn } from "../../../lib/cn";
import GlassChip from "../../glass/GlassChip";
import GlassSwitch from "../../glass/GlassSwitch";
import { CALC_TILE, CALC_TILE_HOVER } from "../calcGlass";

interface OptionTileProps {
  label: ReactNode;
  active: boolean;
  onToggle?: () => void;
  badge?: string;
  children?: ReactNode;
}

/** Umschaltbare Kachel aus v1 (Rabatte, GigaKombi, Gutschrift) mit Glas-Schalter; feste Optionen zeigen eine Plakette. */
export default function OptionTile({ label, active, onToggle, badge, children }: OptionTileProps) {
  return (
    <div
      role={onToggle ? "switch" : undefined}
      aria-checked={onToggle ? active : undefined}
      tabIndex={onToggle ? 0 : undefined}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (onToggle && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onToggle();
        }
      }}
      className={cn(
        CALC_TILE,
        "space-y-2 px-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40",
        onToggle ? cn("cursor-pointer", CALC_TILE_HOVER) : "cursor-default",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-[14px] font-medium">{label}</span>
        {onToggle && !badge ? <GlassSwitch checked={active} /> : <GlassChip tone={active ? "green" : "slate"}>{badge}</GlassChip>}
      </div>
      {children}
    </div>
  );
}
