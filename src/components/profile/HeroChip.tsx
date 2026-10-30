import type { ReactNode } from "react";
import GlassChip from "../glass/GlassChip";

interface HeroChipProps {
  tone?: "red" | "slate" | "amber" | "green" | "blue";
  children: ReactNode;
}

/** Kleine Plakette unter dem Namen auf der tiefen Kopfkarte (Rolle, Team, Vertragsmonat). */
export default function HeroChip({ tone = "slate", children }: HeroChipProps) {
  return (
    <GlassChip tone={tone} onDeep>
      {children}
    </GlassChip>
  );
}
