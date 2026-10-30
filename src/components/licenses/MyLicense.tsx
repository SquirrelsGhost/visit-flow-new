import { BadgeCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { loadSubscription, loadTeamName } from "../../lib/profile/profileApi";
import type { Subscription } from "../../lib/profile/profileTypes";
import { licenseTexts } from "../../texts/licenseTexts";
import GlassBody from "../glass/GlassBody";
import GlassRow from "../glass/GlassRow";
import GlassSection from "../glass/GlassSection";
import StatusPill from "../profile/StatusPill";

interface MyLicenseProps {
  teamId: string | undefined;
}

const texts = licenseTexts.mine;

/** Berater, Mentoren und Strukturleiter sehen nur ihren eigenen Stand; verwalten darf die Teamleitung. */
export default function MyLicense({ teamId }: MyLicenseProps) {
  const [team, setTeam] = useState<string>();
  const [subscription, setSubscription] = useState<Subscription | null>();

  useEffect(() => {
    let alive = true;
    void loadTeamName(teamId).then((name) => alive && setTeam(name));
    void loadSubscription().then((sub) => alive && setSubscription(sub));
    return () => {
      alive = false;
    };
  }, [teamId]);

  return (
    <GlassBody>
      <GlassSection label={texts.label} footer={texts.footer}>
        <GlassRow icon={BadgeCheck} tone="green" title={texts.title} subtitle={team ?? licenseTexts.loading} trailing={subscription && <StatusPill status={subscription.status} />} />
      </GlassSection>
    </GlassBody>
  );
}
