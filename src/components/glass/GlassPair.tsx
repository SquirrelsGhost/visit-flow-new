import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { GLASS_PAIR, GLASS_PAIR_OFFSET } from "./glassStyles";

interface GlassPairProps {
  /** Welche Karte keine Überschrift hat: sie rückt um die Überschriftshöhe nach unten, damit beide Karten oben bündig stehen. */
  offset?: keyof typeof GLASS_PAIR_OFFSET;
  children: ReactNode;
}

/** Zwei Karten nebeneinander und gleich hoch ab iPad quer; auf dem Handy untereinander. */
export default function GlassPair({ offset, children }: GlassPairProps) {
  return <div className={cn(GLASS_PAIR, offset && GLASS_PAIR_OFFSET[offset])}>{children}</div>;
}
