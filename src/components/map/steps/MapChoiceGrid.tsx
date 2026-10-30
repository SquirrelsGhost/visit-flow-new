import { cn } from "../../../lib/cn";
import type { Choice } from "../../../lib/map/visitSteps";
import { CHIP_ACTIVE, CHIP_BASE, CHIP_IDLE } from "./stepStyles";

interface MapChoiceGridProps {
  choices: Choice[];
  value: string | undefined;
  onChange: (id: string | undefined) => void;
  /** Farbe der gewählten Kachel (Statusfarbe des Schritts). */
  color: string;
  columns?: 2 | 3;
  /** Erneutes Antippen hebt die Wahl wieder auf (v1 Kundentyp). */
  toggle?: boolean;
}

/** Auswahl-Kacheln für Gründe, Kundentypen und Terminarten. */
export default function MapChoiceGrid({ choices, value, onChange, color, columns = 2, toggle = false }: MapChoiceGridProps) {
  return (
    <div className={cn("grid gap-2", columns === 3 ? "grid-cols-3" : "grid-cols-2")}>
      {choices.map((c) => {
        const active = value === c.id;
        return (
          <button
            key={c.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(active && toggle ? undefined : c.id)}
            className={cn(
              CHIP_BASE,
              "flex min-h-[44px] items-center gap-2 text-left",
              c.icon && "min-h-[56px]",
              active ? CHIP_ACTIVE : CHIP_IDLE,
            )}
            style={active ? { background: color } : undefined}
          >
            {c.icon && <span className="text-lg leading-none">{c.icon}</span>}
            <span className="leading-tight">{c.label}</span>
          </button>
        );
      })}
    </div>
  );
}
