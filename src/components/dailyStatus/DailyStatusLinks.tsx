import { Activity, LayoutPanelLeft, Swords } from "lucide-react";
import { dailyStatusTexts as texts } from "../../texts/dailyStatusTexts";
import GlassRow from "../glass/GlassRow";
import GlassSection from "../glass/GlassSection";

const LINKS = { battle: "/battle", team: "/team-performance", overview: "/daily-view" } as const;

/** Wohin der Status wirkt: Battle (wer heute antritt), Teamleistung und die eigene Übersicht. */
export interface DailyStatusLinksProps { readonly _?: never; }

export default function DailyStatusLinks() {
  return (
    <GlassSection label={texts.links}>
      <GlassRow icon={Swords} tone="red" title={texts.toBattle} subtitle={texts.toBattleText} href={LINKS.battle} />
      <GlassRow icon={Activity} tone="indigo" title={texts.toTeam} subtitle={texts.toTeamText} href={LINKS.team} />
      <GlassRow icon={LayoutPanelLeft} tone="blue" title={texts.toOverview} subtitle={texts.toOverviewText} href={LINKS.overview} />
    </GlassSection>
  );
}
