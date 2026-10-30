import { ChevronsUpDown, type LucideIcon } from "lucide-react";
import { cn } from "../../lib/cn";
import type { SettingsTone } from "../../lib/settings/settingsTones";
import SettingsRowText from "./SettingsRowText";
import SettingsRowTile from "./SettingsRowTile";
import { ROW, ROW_INTERACTIVE, ROW_VALUE } from "./settingsStyles";

export interface SettingsOption {
  value: string;
  label: string;
}

interface SettingsSelectRowProps {
  icon: LucideIcon;
  tone: SettingsTone;
  title: string;
  subtitle?: string;
  value: string;
  options: readonly SettingsOption[];
  onChange: (value: string) => void;
}

/**
 * Auswahl-Zeile: rechts steht der gewählte Wert. Darüber liegt ein unsichtbares natives Auswahlfeld,
 * damit Handys ihr gewohntes Auswahlrad zeigen.
 */
export default function SettingsSelectRow({ icon, tone, title, subtitle, value, options, onChange }: SettingsSelectRowProps) {
  const current = options.find((option) => option.value === value)?.label ?? value;
  return (
    <div className={cn(ROW, ROW_INTERACTIVE, "relative focus-within:bg-[var(--glass-hover)]")}>
      <SettingsRowTile icon={icon} tone={tone} />
      <SettingsRowText title={title} subtitle={subtitle} />
      <span className={cn(ROW_VALUE, "flex max-w-[45%] items-center gap-1")}>
        <span className="truncate">{current}</span>
        <ChevronsUpDown aria-hidden className="h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-white/30" />
      </span>
      <select aria-label={title} value={value} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 h-full w-full cursor-pointer appearance-none opacity-0">
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
