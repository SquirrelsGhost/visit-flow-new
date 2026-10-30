import GlassSwitch from "../glass/GlassSwitch";

interface SettingsSwitchProps {
  checked: boolean;
}

/** Der Schalter selbst (nur Optik); die ganze Zeile ist der bedienbare Schalter. */
export default function SettingsSwitch({ checked }: SettingsSwitchProps) {
  return <GlassSwitch checked={checked} />;
}
