import type { LucideIcon } from "lucide-react";
import { cn } from "../../lib/cn";
import { feedback } from "../../lib/feedback/feedback";
import type { SettingsTone } from "../../lib/settings/settingsTones";
import SettingsRowText from "./SettingsRowText";
import SettingsRowTile from "./SettingsRowTile";
import SettingsSwitch from "./SettingsSwitch";
import { ROW, ROW_INTERACTIVE } from "./settingsStyles";

interface SettingsSwitchRowProps {
  icon: LucideIcon;
  tone: SettingsTone;
  title: string;
  subtitle?: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  warn?: boolean;
}

/** Ein/Aus-Zeile (v1: AN/AUS-Karten). Die ganze Zeile ist ein Schalter und per Tastatur bedienbar. */
export default function SettingsSwitchRow({ icon, tone, title, subtitle, checked, onChange, disabled, warn }: SettingsSwitchRowProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={title}
      disabled={disabled}
      onClick={() => {
        feedback(checked ? "toggleOff" : "toggleOn");
        onChange();
      }}
      className={cn(ROW, ROW_INTERACTIVE, "disabled:cursor-wait")}
    >
      <SettingsRowTile icon={icon} tone={tone} />
      <SettingsRowText title={title} subtitle={subtitle} warn={warn} />
      <SettingsSwitch checked={checked} />
    </button>
  );
}
