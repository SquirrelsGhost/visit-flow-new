import { Check, Gauge } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "../../hooks/useTranslation";
import { settingsTexts } from "../../texts/settingsTexts";
import SettingsActionButton from "./SettingsActionButton";
import SettingsExpandRow from "./SettingsExpandRow";
import SettingsField from "./SettingsField";

interface MileageRowProps {
  currentKm?: number;
  onSave: (km: number) => void;
}

const formatKm = (km: number) => `${km.toLocaleString("de-DE")} km`;

/** Kilometerstand fürs Fahrtenbuch (v1 PersonalSettings), nur bei Auto-Kilometerstand. */
export default function MileageRow({ currentKm, onSave }: MileageRowProps) {
  const { t } = useTranslation();
  const [value, setValue] = useState(currentKm?.toString() ?? "");

  const save = () => {
    const km = Number.parseInt(value, 10);
    if (!value || Number.isNaN(km) || km < 0) {
      toast.error(t("settings.personal.invalidKm"));
      return;
    }
    onSave(km);
    toast.success(t("settings.personal.kmStandSaved"));
  };

  return (
    <SettingsExpandRow
      icon={Gauge}
      tone="orange"
      title={t("settings.personal.kmStand")}
      subtitle={t("settings.personal.kmStandDescription")}
      value={currentKm !== undefined ? formatKm(currentKm) : settingsTexts.kmEmpty}
    >
      <SettingsField type="number" min="0" inputMode="numeric" label={t("settings.personal.kmStand")} placeholder={t("settings.personal.kmPlaceholder")} value={value} onChange={(e) => setValue(e.target.value)} onFocus={(e) => e.target.select()} />
      <SettingsActionButton icon={Check} label={t("settings.personal.saveKmStand")} onClick={save} />
    </SettingsExpandRow>
  );
}
