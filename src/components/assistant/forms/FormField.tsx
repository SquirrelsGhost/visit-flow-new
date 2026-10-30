import type { HTMLInputTypeAttribute } from "react";
import { cn } from "../../../lib/cn";
import { GLASS_FIELD } from "../../glass/glassStyles";
import { FORM_FIELD_LABEL } from "./formStyles";

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: HTMLInputTypeAttribute;
  /** Ganze Zeile im zweispaltigen Raster. */
  wide?: boolean;
  autoComplete?: string;
  maxLength?: number;
}

const MAX_LENGTH = 120;

/** Beschriftetes Glas-Eingabefeld; die Beschriftung bleibt sichtbar, auch wenn das Feld gefüllt ist. */
export default function FormField({ label, value, onChange, type = "text", wide = false, autoComplete = "off", maxLength = MAX_LENGTH }: FormFieldProps) {
  return (
    <label className={cn("block min-w-0", wide && "col-span-2")}>
      <span className={FORM_FIELD_LABEL}>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        maxLength={maxLength}
        className={cn(GLASS_FIELD, type === "date" && "px-3 dark:[color-scheme:dark]")}
      />
    </label>
  );
}
