import type { Vertical } from "../../lib/battle/battleCategories";
import { isJuniorMonth, tierOf } from "../../lib/profile/profileRules";
import type { ProfileData, XpProgress } from "../../lib/profile/profileTypes";
import { TIER_GLOW } from "../../lib/profile/tierStyles";
import { roleLabel } from "../../texts/appTexts";
import { fill, profileTexts } from "../../texts/profileTexts";
import GlassCard from "../glass/GlassCard";
import GlassHeader from "../glass/GlassHeader";
import HeroChip from "./HeroChip";
import XpRing from "./XpRing";

interface ProfileHeroProps {
  profile: ProfileData;
  xp: XpProgress | null | undefined;
  teamName: string | undefined;
  vertical: Vertical;
  demo: boolean;
}

const texts = profileTexts;

function xpLine(xp: XpProgress | null | undefined): string {
  if (xp === undefined) return " ";
  if (!xp) return texts.noLevel;
  return `${texts.tiers[tierOf(xp.level)]} · ${fill(texts.xp, { current: xp.current, next: xp.next })}`;
}

/** Kopf der Profilseite als tiefe Karte: Avatar im leuchtenden XP-Ring, Name, Nickname und die wichtigsten Plaketten. */
export default function ProfileHero({ profile, xp, teamName, vertical, demo }: ProfileHeroProps) {
  const tier = tierOf(xp?.level ?? 1);
  const month = profile.contractMonth;
  return (
    <GlassCard variant="deep" sheen spotlight className="px-5 pb-6 pt-8">
      <span aria-hidden className={`pointer-events-none absolute inset-0 bg-gradient-to-b ${TIER_GLOW[tier]} via-transparent to-transparent`} />
      <GlassHeader
        leading={<XpRing initial={profile.name.charAt(0).toUpperCase()} xp={xp} tier={tier} label={xp ? fill(texts.levelShort, { level: xp.level }) : texts.noLevel} />}
        title={profile.name}
        subtitle={
          <>
            {profile.nickname && <p>@{profile.nickname}</p>}
            <p className="mt-1.5 text-[12px] font-medium tracking-wide text-white/45">{xpLine(xp)}</p>
          </>
        }
      >
        <HeroChip tone="red">{roleLabel(profile.role)}</HeroChip>
        <HeroChip>{teamName ?? texts.noTeam}</HeroChip>
        {vertical === "telco" && (
          <HeroChip tone={month === null ? "amber" : isJuniorMonth(month) ? "green" : "blue"}>
            {month === null ? texts.contract.none : `${fill(texts.contract.month, { month })} · ${isJuniorMonth(month) ? texts.contract.junior : texts.contract.regular}`}
          </HeroChip>
        )}
        {demo && <HeroChip tone="amber">{texts.demoBadge}</HeroChip>}
      </GlassHeader>
    </GlassCard>
  );
}
