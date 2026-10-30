import { Headphones, Smartphone, Volume1, Volume2 } from "lucide-react";
import { useState } from "react";
import { useFeedbackPrefs } from "../../hooks/useFeedbackPrefs";
import { playSound } from "../../lib/feedback/feedback";
import { FEEDBACK_VOLUMES, type FeedbackVolume } from "../../lib/feedback/feedbackPrefs";
import { feedbackTexts as t } from "../../texts/feedbackTexts";
import FeedbackPreviewSheet from "./FeedbackPreviewSheet";
import SettingsGroup from "./SettingsGroup";
import SettingsRow from "./SettingsRow";
import SettingsSelectRow from "./SettingsSelectRow";
import SettingsSwitchRow from "./SettingsSwitchRow";

/** Gruppe "Sounds & Haptik": Klänge, Lautstärke, Vibration und die Vorhör-Liste. Gilt für dieses Gerät. */
export interface FeedbackSettingsGroupProps { readonly _?: never; }

export default function FeedbackSettingsGroup() {
  const { prefs, update } = useFeedbackPrefs();
  const [preview, setPreview] = useState(false);

  const changeVolume = (value: string) => {
    update({ volume: value as FeedbackVolume });
    // Gleich hören, wie laut es jetzt ist
    playSound("success");
  };

  return (
    <SettingsGroup label={t.group} footer={t.footer}>
      <SettingsSwitchRow icon={Volume2} tone="purple" title={t.sound} subtitle={t.soundText} checked={prefs.sound} onChange={() => update({ sound: !prefs.sound })} />
      {prefs.sound && (
        <SettingsSelectRow
          icon={Volume1}
          tone="indigo"
          title={t.volume}
          value={prefs.volume}
          options={FEEDBACK_VOLUMES.map((volume) => ({ value: volume, label: t.volumes[volume] }))}
          onChange={changeVolume}
        />
      )}
      <SettingsSwitchRow icon={Smartphone} tone="blue" title={t.haptics} subtitle={t.hapticsText} checked={prefs.haptics} onChange={() => update({ haptics: !prefs.haptics })} />
      <SettingsRow icon={Headphones} tone="green" title={t.preview} subtitle={t.previewText} onClick={() => setPreview(true)} />
      <FeedbackPreviewSheet open={preview} onClose={() => setPreview(false)} />
    </SettingsGroup>
  );
}
