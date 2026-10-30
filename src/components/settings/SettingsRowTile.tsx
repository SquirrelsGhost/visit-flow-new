import type { LucideIcon } from "lucide-react";
import type { SettingsTone } from "../../lib/settings/settingsTones";
import GlassIcon from "../glass/GlassIcon";

interface SettingsRowTileProps {
  icon: LucideIcon;
  tone: SettingsTone;
}

/** Farbiges Symbol am Anfang jeder Zeile; die Farbe ordnet die Zeile auf einen Blick ein. */
export default function SettingsRowTile({ icon, tone }: SettingsRowTileProps) {
  return <GlassIcon icon={icon} tone={tone} />;
}
