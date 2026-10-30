import { useId } from "react";
import { cn } from "../../../lib/cn";
import { ungueltig } from "../../../lib/energy/energyState";
import { CALC_FIELD_LABEL, CALC_FIELD_WRAP } from "../calcGlass";

interface EnergyFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
  placeholder?: string;
  numerisch?: boolean;
}

/** Eingabefeld mit Einheit (v1 Feld). Deutsche Zahlen mit Komma, ungültige Eingaben werden rot umrandet. */
export default function EnergyField({ label, value, onChange, suffix, placeholder, numerisch = true }: EnergyFieldProps) {
  const id = useId();
  const fehler = numerisch && ungueltig(value);
  return (
    <div className="block min-w-0">
      <label htmlFor={id} className={CALC_FIELD_LABEL}>
        {label}
      </label>
      <div
        className={cn(
          "mt-1.5",
          CALC_FIELD_WRAP,
          fehler && "border-rose-500 ring-1 ring-rose-500/40 focus-within:border-rose-500",
        )}
      >
        <input
          id={id}
          type="text"
          inputMode={numerisch ? "decimal" : "text"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-invalid={fehler}
          className={cn(
            "h-full w-full min-w-0 bg-transparent text-base text-foreground outline-none placeholder:text-slate-400 sm:text-sm dark:placeholder:text-white/30",
            numerisch && "tabular-nums",
          )}
        />
        {suffix && <span className="ml-2 shrink-0 text-xs font-medium text-[var(--glass-label)]">{suffix}</span>}
      </div>
    </div>
  );
}
