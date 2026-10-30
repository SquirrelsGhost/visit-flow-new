import type { ReactNode } from "react";

export interface GlassFlowItemProps {
  /** Spalte ab iPad quer; auf dem Handy zählt nur die Reihenfolge im Quelltext. */
  col?: "left" | "right";
  children: ReactNode;
}

/** Ein Eintrag in GlassFlow. Rendert nur seinen Inhalt; GlassFlow liest die Spalte. */
export default function GlassFlowItem({ children }: GlassFlowItemProps) {
  return <>{children}</>;
}
