import type { ProfileData, SaveProfile } from "../../lib/profile/profileTypes";
import { profileTexts } from "../../texts/profileTexts";
import SettingsGroup from "../settings/SettingsGroup";
import BillingRow from "./BillingRow";
import NameEmailRow from "./NameEmailRow";
import NicknameRow from "./NicknameRow";

interface PersonalGroupProps {
  profile: ProfileData;
  onSave: SaveProfile;
}

/** Persönliche Daten: jede Angabe klappt einzeln auf, statt wie v1 alles auf einmal zu bearbeiten. */
export default function PersonalGroup({ profile, onSave }: PersonalGroupProps) {
  return (
    <SettingsGroup label={profileTexts.groups.personal}>
      <NameEmailRow name={profile.name} email={profile.email} onSave={onSave} />
      <NicknameRow nickname={profile.nickname} changedAt={profile.nicknameChangedAt} onSave={onSave} />
      <BillingRow billing={profile.billing} onSave={onSave} />
    </SettingsGroup>
  );
}
