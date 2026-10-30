import { Briefcase, Calculator, Settings } from "lucide-react";
import { profileTexts } from "../../texts/profileTexts";
import SettingsGroup from "../settings/SettingsGroup";
import SettingsRow from "../settings/SettingsRow";

const texts = profileTexts.more;
/** v1 hatte den Simulator aufklappbar im Profil; in v2 hat er eine eigene Seite. */
const SIMULATOR_HREF = "/provisions-simulator";
const SETTINGS_HREF = "/settings";
const CRM_HREF = "/crm";

/** Weiterführende Ziele am Ende der Seite. */
export interface MoreGroupProps { readonly _?: never; }

export default function MoreGroup() {
  return (
    <SettingsGroup label={profileTexts.groups.more}>
      <SettingsRow icon={Briefcase} tone="orange" title={texts.crm} subtitle={texts.crmText} href={CRM_HREF} />
      <SettingsRow icon={Calculator} tone="green" title={texts.simulator} subtitle={texts.simulatorText} href={SIMULATOR_HREF} />
      <SettingsRow icon={Settings} tone="purple" title={texts.settings} subtitle={texts.settingsText} href={SETTINGS_HREF} />
    </SettingsGroup>
  );
}
