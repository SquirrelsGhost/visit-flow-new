import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import type { SettingsTone } from "../../lib/settings/settingsTones";
import GlassRow from "../glass/GlassRow";

interface SettingsRowProps {
  icon: LucideIcon;
  tone: SettingsTone;
  title: string;
  subtitle?: string;
  /** Kurzer Wert rechts (z. B. "Laufliste"). */
  value?: string;
  /** Eigener Inhalt rechts (z. B. Status-Plakette). */
  trailing?: ReactNode;
  href?: string;
  /** Aktion beim Tippen; mit href läuft sie vor dem Seitenwechsel. */
  onClick?: () => void;
  warn?: boolean;
  /** Pfeil rechts; Standard bei Ziel oder Aktion. */
  chevron?: boolean;
}

/** Eine Zeile der Einstellungen: Symbol, Text, Wert. Mit Ziel oder Aktion bekommt sie einen Pfeil. */
export default function SettingsRow(props: SettingsRowProps) {
  return <GlassRow {...props} />;
}
