import type { ReactNode } from "react";
import GlassStat from "../glass/GlassStat";

interface StatTileProps {
  label: string;
  children: ReactNode;
}

/** Kleine Kennzahl neben dem großen Monatsbetrag: Beschriftung oben, Zahl darunter. */
export default function StatTile({ label, children }: StatTileProps) {
  return (
    <GlassStat label={label} className="px-5 py-4">
      {children}
    </GlassStat>
  );
}
