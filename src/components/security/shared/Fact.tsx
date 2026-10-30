import type { ReactNode } from "react";
import { FACT_LABEL } from "../securityStyles";

interface FactProps {
  label: string;
  children: ReactNode;
  /** Über die ganze Breite der Detail-Fläche (lange Texte wie Grund oder Browser). */
  wide?: boolean;
}

/** Ein Wert in aufgeklappten Details: Beschriftung klein, Wert darunter. */
export default function Fact({ label, children, wide }: FactProps) {
  return (
    <div className={wide ? "col-span-2 min-w-0" : "min-w-0"}>
      <span className={FACT_LABEL}>{label}</span>
      <span className="mt-0.5 block break-words text-[13px] text-foreground">{children}</span>
    </div>
  );
}
