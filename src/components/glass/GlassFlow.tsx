import { Children, isValidElement, type ReactElement, type ReactNode } from "react";
import { cn } from "../../lib/cn";
import type { GlassFlowItemProps } from "./GlassFlowItem";
import { GLASS_SPLIT_RATIO } from "./glassStyles";

interface GlassFlowProps {
  ratio?: keyof typeof GLASS_SPLIT_RATIO;
  /** Abstand zwischen Karten: 28px (Glas-Seiten) oder 16px (dichte Reiter wie im Assistenten). */
  gap?: "page" | "tight";
  children: ReactNode;
}

const GAP = { page: "gap-7", tight: "gap-4" } as const;
const COLUMN = "contents lg:flex lg:min-w-0 lg:flex-col";

/**
 * Zwei feste Spalten ab iPad quer, ohne die Reihenfolge auf dem Handy zu ändern: Jeder GlassFlowItem sagt,
 * in welche Spalte er gehört. Auf dem Handy lösen sich die Spalten auf (display: contents) und die
 * Einträge stehen per CSS-order genau in der Reihenfolge des Quelltexts untereinander.
 */
export default function GlassFlow({ ratio = "even", gap = "page", children }: GlassFlowProps) {
  const items = Children.toArray(children).filter(isValidElement) as ReactElement<GlassFlowItemProps>[];
  const column = (side: "left" | "right") =>
    items.map((item, index) =>
      (item.props.col ?? "left") === side ? (
        <div key={item.key ?? index} className="min-w-0" style={{ order: index }}>
          {item}
        </div>
      ) : null,
    );
  return (
    <div className={cn("flex flex-col lg:grid lg:items-start", GAP[gap], GLASS_SPLIT_RATIO[ratio])}>
      <div className={cn(COLUMN, GAP[gap])}>{column("left")}</div>
      <div className={cn(COLUMN, GAP[gap])}>{column("right")}</div>
    </div>
  );
}
