import type { InputHTMLAttributes } from "react";
import { GLASS_FIELD } from "../../glass/glassStyles";
import { FACT_LABEL } from "../securityStyles";

interface SheetFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "className"> {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

/** Beschriftetes Eingabefeld im Glas-Look für die Formulare im Sheet. */
export default function SheetField({ label, value, onChange, ...rest }: SheetFieldProps) {
  return (
    <label className="block space-y-1.5">
      <span className={FACT_LABEL}>{label}</span>
      <input {...rest} value={value} onChange={(e) => onChange(e.target.value)} className={GLASS_FIELD} />
    </label>
  );
}
