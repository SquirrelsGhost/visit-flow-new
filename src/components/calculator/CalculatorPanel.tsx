import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import type { CalcTab } from "../../hooks/useCalculatorSwipe";

interface CalculatorPanelProps {
  tab: CalcTab;
  active: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * Eine Hälfte der Wischfläche. Beide bleiben gerendert (das Angebot geht beim Wechseln nicht verloren),
 * die verdeckte ist blass wie in v1 und per `inert` für Tastatur und Screenreader gesperrt.
 */
export default function CalculatorPanel({ tab, active, className, children }: CalculatorPanelProps) {
  return (
    <div
      id={`calc-panel-${tab}`}
      role="tabpanel"
      aria-labelledby={`calc-tab-${tab}`}
      inert={!active}
      className={cn(
        "w-1/2 shrink-0 transition-opacity duration-300 motion-reduce:transition-none [contain:layout_style]",
        active ? "opacity-100" : "max-h-[calc(100dvh-12rem)] overflow-hidden opacity-40",
        className,
      )}
    >
      {children}
    </div>
  );
}
