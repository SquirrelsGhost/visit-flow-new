import type { ReactNode } from "react";
import { CALC_FIELD_LABEL } from "../calcGlass";

interface FieldProps {
  label: string;
  htmlFor?: string;
  onLabelClick?: () => void;
  children: ReactNode;
}

/** Beschriftetes Feld aus v1. Ein Tipp auf die Beschriftung kann die Geheimfunktion auslösen. */
export default function Field({ label, htmlFor, onLabelClick, children }: FieldProps) {
  return (
    <div className="min-w-0 space-y-1.5">
      <label htmlFor={htmlFor} onClick={onLabelClick} className={`block cursor-default select-none ${CALC_FIELD_LABEL}`}>
        {label}
      </label>
      {children}
    </div>
  );
}
