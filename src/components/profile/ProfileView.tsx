// Benutzer, Demo-Sitzung und Bereich kommen aus dem Browser
"use client";

import { useLevelUpMoment } from "../../hooks/useLevelUpMoment";
import { useProfile } from "../../hooks/useProfile";
import { useProfileExtras } from "../../hooks/useProfileExtras";
import { useVertical } from "../../hooks/useVertical";
import GlassPage from "../glass/GlassPage";
import GlassPair from "../glass/GlassPair";
import GlassSplit from "../glass/GlassSplit";
import SettingsTabBody from "../settings/SettingsTabBody";
import AchievementsGroup from "./AchievementsGroup";
import LeaderboardGroup from "./LeaderboardGroup";
import MoreGroup from "./MoreGroup";
import PersonalGroup from "./PersonalGroup";
import ProfileHero from "./ProfileHero";
import ProfileStats from "./ProfileStats";
import RoleTeamGroup from "./RoleTeamGroup";
import SecurityGroup from "./SecurityGroup";
import SubscriptionGroup from "./SubscriptionGroup";

/**
 * Profil (/profile, v1 ProfileView): wer ich bin, meine Daten, Rolle, Abo und Erfolge als Glaskarten.
 * App-Einstellungen, Biometrie und Datenschutz bleiben in den Einstellungen und sind von hier verlinkt.
 */
export interface ProfileViewProps { readonly _?: never; }

export default function ProfileView() {
  const { profile, demo, save } = useProfile();
  const extras = useProfileExtras(profile?.teamId);
  const vertical = useVertical();
  useLevelUpMoment(extras.xp?.level);
  if (!profile) return null;

  return (
    <GlassPage>
      <div className="h-full overflow-y-auto overflow-x-hidden">
        <SettingsTabBody layout="wide">
          <GlassPair offset="first">
            <ProfileHero profile={profile} xp={extras.xp} teamName={extras.teamName} vertical={vertical} demo={demo} />
            <ProfileStats metrics={extras.metrics} vertical={vertical} />
          </GlassPair>
          <GlassSplit
            ratio="even"
            aside={
              <>
                <PersonalGroup profile={profile} onSave={save} />
                <RoleTeamGroup profile={profile} teamName={extras.teamName} vertical={vertical} onSave={save} />
                <LeaderboardGroup anonymous={profile.anonymous} onSave={save} />
                <SecurityGroup />
              </>
            }
          >
            <SubscriptionGroup role={profile.role} teamName={extras.teamName} subscription={extras.subscription} />
            <AchievementsGroup achievements={extras.achievements} />
            <MoreGroup />
          </GlassSplit>
        </SettingsTabBody>
      </div>
    </GlassPage>
  );
}
