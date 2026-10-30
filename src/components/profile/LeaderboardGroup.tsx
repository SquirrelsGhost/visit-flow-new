import { EyeOff } from "lucide-react";
import { useState } from "react";
import type { SaveProfile } from "../../lib/profile/profileTypes";
import { profileTexts } from "../../texts/profileTexts";
import SettingsGroup from "../settings/SettingsGroup";
import SettingsSwitchRow from "../settings/SettingsSwitchRow";
import ConfirmDialog from "./ConfirmDialog";

interface LeaderboardGroupProps {
  anonymous: boolean;
  onSave: SaveProfile;
}

const texts = profileTexts.leaderboard;

/** Anonym im Leaderboard (v1 Anonymitäts-Dialog): Schalter mit kurzer Rückfrage, weil das Team die Änderung sieht. */
export default function LeaderboardGroup({ anonymous, onSave }: LeaderboardGroupProps) {
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);
  const next = !anonymous;

  const confirm = async () => {
    setBusy(true);
    const ok = await onSave({ isAnonymousInLeaderboard: next }, next ? texts.activated : texts.deactivated);
    setBusy(false);
    if (ok) setAsking(false);
  };

  return (
    <SettingsGroup label={profileTexts.groups.leaderboard}>
      <SettingsSwitchRow
        icon={EyeOff}
        tone="gray"
        title={texts.anonymous}
        subtitle={anonymous ? texts.anonymousOn : texts.anonymousOff}
        checked={anonymous}
        onChange={() => setAsking(true)}
      />
      <ConfirmDialog
        open={asking}
        title={next ? texts.confirmOnTitle : texts.confirmOffTitle}
        confirmLabel={next ? texts.confirmOn : texts.confirmOff}
        cancelLabel={texts.cancel}
        busy={busy}
        onConfirm={confirm}
        onClose={() => setAsking(false)}
      >
        {next ? texts.confirmOnText : texts.confirmOffText}
      </ConfirmDialog>
    </SettingsGroup>
  );
}
