import { Trophy } from "lucide-react";
import type { Achievement } from "../../lib/profile/profileTypes";
import { fill, profileTexts } from "../../texts/profileTexts";
import SettingsGroup from "../settings/SettingsGroup";
import SettingsRow from "../settings/SettingsRow";
import AchievementRow from "./AchievementRow";

interface AchievementsGroupProps {
  achievements: readonly Achievement[] | undefined;
}

const texts = profileTexts.achievements;
const share = (a: Achievement) => (a.target > 0 ? a.current / a.target : 0);

/** Erfolge (v1 AchievementShowcase), sortiert wie dort: am nächsten an der nächsten Stufe zuerst. */
export default function AchievementsGroup({ achievements }: AchievementsGroupProps) {
  if (!achievements) return null;
  const sorted = [...achievements].sort((a, b) => share(b) - share(a));
  const unlocked = achievements.filter((a) => a.tier).length;
  const footer = achievements.length ? fill(texts.summary, { unlocked, total: achievements.length }) : undefined;
  return (
    <SettingsGroup label={profileTexts.groups.achievements} footer={footer}>
      {sorted.length ? sorted.map((a) => <AchievementRow key={a.id} achievement={a} />) : <SettingsRow icon={Trophy} tone="amber" title={profileTexts.groups.achievements} subtitle={texts.empty} />}
    </SettingsGroup>
  );
}
