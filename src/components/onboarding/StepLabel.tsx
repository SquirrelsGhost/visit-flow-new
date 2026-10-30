import type { ReactNode } from "react";

interface StepLabelProps {
  step: number;
  label: string;
  htmlFor?: string;
  /** Inhalt rechts neben der Überschrift, z. B. Schnellwahl oder Hinweis. */
  children?: ReactNode;
}

/** Nummerierte Abschnittsüberschrift aus v1 (roter Kreis mit Ziffer). */
export default function StepLabel({ step, label, htmlFor, children }: StepLabelProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <label
        htmlFor={htmlFor}
        className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-b from-red-500 to-red-600 text-[11px] font-bold text-white shadow-[0_2px_6px_-2px_rgba(220,38,38,0.6)]">
          {step}
        </span>
        {label}
      </label>
      {children}
    </div>
  );
}
