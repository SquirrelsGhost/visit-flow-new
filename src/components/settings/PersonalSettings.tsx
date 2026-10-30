import { Bot, Brain, Car, LayoutList } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "../../hooks/useTranslation";
import { useUserSettings } from "../../hooks/useUserSettings";
import { coachMemoryTexts } from "../../texts/coachMemoryTexts";
import { settingsTexts } from "../../texts/settingsTexts";
import CoachMemorySheet from "../copilot/CoachMemorySheet";
import HomeAddressRow from "./HomeAddressRow";
import MileageRow from "./MileageRow";
import ProfileCard from "./ProfileCard";
import SettingsGroup from "./SettingsGroup";
import SettingsRow from "./SettingsRow";
import SettingsSwitchRow from "./SettingsSwitchRow";
import SettingsTabBody from "./SettingsTabBody";

const groups = settingsTexts.groups;

/** Reiter Persönlich (v1 PersonalSettings), geordnet nach Fahrten, Zuhause und Assistent. */
export interface PersonalSettingsProps { readonly _?: never; }

export default function PersonalSettings() {
  const { t } = useTranslation();
  const { settings, update } = useUserSettings();
  const [memory, setMemory] = useState(false);

  const toggleAutoKm = () => {
    const next = !settings.autoKmTracking;
    update({ autoKmTracking: next });
    toast.success(t(next ? "settings.personal.autoKmActivated" : "settings.personal.autoKmDeactivated"));
  };

  const toggleAiAssistant = () => {
    const next = !settings.showAiAssistant;
    update({ showAiAssistant: next });
    toast.success(t(next ? "settings.personal.aiAssistantEnabledToast" : "settings.personal.aiAssistantDisabledToast"));
  };

  return (
    <SettingsTabBody>
      <ProfileCard />
      <SettingsGroup label={groups.trips}>
        <SettingsSwitchRow
          icon={Car}
          tone="blue"
          title={t("settings.personal.autoKm")}
          subtitle={t(settings.autoKmTracking ? "settings.personal.autoKmEnabled" : "settings.personal.autoKmDisabled")}
          checked={settings.autoKmTracking}
          onChange={toggleAutoKm}
        />
        {settings.autoKmTracking && <MileageRow currentKm={settings.currentKm} onSave={(currentKm) => update({ currentKm })} />}
      </SettingsGroup>
      <SettingsGroup label={groups.home}>
        <HomeAddressRow saved={settings.homeAddress} onSave={(homeAddress) => update({ homeAddress })} />
      </SettingsGroup>
      <SettingsGroup label={groups.assistant}>
        <SettingsSwitchRow
          icon={Bot}
          tone="red"
          title={t("settings.personal.aiAssistant")}
          subtitle={t(settings.showAiAssistant ? "settings.personal.aiAssistantEnabled" : "settings.personal.aiAssistantDisabled")}
          checked={settings.showAiAssistant}
          onChange={toggleAiAssistant}
        />
        <SettingsRow icon={Brain} tone="purple" title={coachMemoryTexts.title} subtitle={coachMemoryTexts.rowSubtitle} onClick={() => setMemory(true)} />
        <SettingsRow icon={LayoutList} tone="indigo" title={t("settings.personal.defaultView")} subtitle={t("settings.personal.defaultViewDescription")} value={t("settings.personal.runList")} />
      </SettingsGroup>
      <CoachMemorySheet open={memory} onClose={() => setMemory(false)} />
    </SettingsTabBody>
  );
}
