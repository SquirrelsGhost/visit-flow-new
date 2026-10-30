import type { ReactNode } from "react";
import GlassSection from "../glass/GlassSection";

interface SettingsGroupProps {
  label?: string;
  /** Erklärung unter der Gruppe (statt eigener Info-Karten wie in v1). */
  footer?: ReactNode;
  children: ReactNode;
}

/** Eine Gruppe zusammengehöriger Einstellungen: Überschrift, Zeilen in einer Glaskarte, Fußnote. */
export default function SettingsGroup({ label, footer, children }: SettingsGroupProps) {
  return (
    <GlassSection label={label} footer={footer}>
      {children}
    </GlassSection>
  );
}
