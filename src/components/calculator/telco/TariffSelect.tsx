import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../../../lib/cn";
import { CALC_SELECT } from "../calcGlass";

interface TariffSelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  children: ReactNode;
}

const SELECT = `${CALC_SELECT} min-w-0 touch-manipulation`;

/** Tarifauswahl. Bewusst nativ: Auf dem Handy öffnet sich die gewohnte Systemliste (v1 nutzte Radix Select). */
export default function TariffSelect({ id, value, onChange, placeholder, className, children }: TariffSelectProps) {
  return (
    <div className={cn("relative min-w-0 flex-1", className)}>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={cn(SELECT, value === "" && "text-muted-foreground")}>
        {placeholder !== undefined && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--glass-label)]" />
    </div>
  );
}
