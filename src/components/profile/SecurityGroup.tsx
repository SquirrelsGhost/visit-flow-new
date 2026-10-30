import { ShieldCheck } from "lucide-react";
import { preselectSettingsTab } from "../../lib/settings/settingsTabs";
import { profileTexts } from "../../texts/profileTexts";
import SettingsGroup from "../settings/SettingsGroup";
import SettingsRow from "../settings/SettingsRow";
import PasswordRow from "./PasswordRow";

const texts = profileTexts.security;
const SETTINGS_HREF = "/settings";

/** Passwort hier; Biometrie, Einwilligungen und Datenschutz bleiben im Reiter Sicherheit der Einstellungen. */
export interface SecurityGroupProps { readonly _?: never; }

export default function SecurityGroup() {
  return (
    <SettingsGroup label={profileTexts.groups.security} footer={texts.footer}>
      <PasswordRow />
      <SettingsRow icon={ShieldCheck} tone="green" title={texts.moreTitle} subtitle={texts.moreText} href={SETTINGS_HREF} onClick={() => preselectSettingsTab("security")} />
    </SettingsGroup>
  );
}
