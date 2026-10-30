import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";
import { GLASS_FIELD } from "../glass/glassStyles";
import { FIELD_LABEL } from "./logbookStyles";

interface LogbookFieldProps extends Omit<ComponentProps<"input">, "onChange"> {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

/** Eingabe mit Beschriftung darüber und Fehlermeldung darunter; Fehler färben den Rand rot. */
export default function LogbookField({ label, value, onChange, error, className, id, ...props }: LogbookFieldProps) {
  const fieldId = id ?? `lb-${label.replace(/\W+/g, "-").toLowerCase()}`;
  return (
    <div className={cn("min-w-0", className)}>
      <label htmlFor={fieldId} className={FIELD_LABEL}>
        {label}
      </label>
      <input
        id={fieldId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        className={cn(GLASS_FIELD, "h-11 px-3.5 tabular-nums", error && "border-red-400/70 focus:border-red-400")}
        {...props}
      />
      {error && (
        <p id={`${fieldId}-error`} className="mt-1 px-1 text-[12px] font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
