import type { ReactNode } from "react";
import GlassBody, { type GlassBodyLayout } from "../glass/GlassBody";

interface SettingsTabBodyProps {
  /** Standard: eine ruhige Spalte (Einstellungen); wide für Seiten mit eigenem Raster. */
  layout?: GlassBodyLayout;
  children: ReactNode;
}

/** Inhalt eines Reiters: die Glaskarten steigen nacheinander weich auf. */
export default function SettingsTabBody({ layout = "stack", children }: SettingsTabBodyProps) {
  return <GlassBody layout={layout}>{children}</GlassBody>;
}
