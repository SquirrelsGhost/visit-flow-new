// Liest die auf der Karte gespeicherten Türen aus dem Browser
"use client";

import { MapPinned } from "lucide-react";
import { useTodayStats } from "../../../hooks/useTodayStats";
import { useVertical } from "../../../hooks/useVertical";
import { HOME_HREF } from "../../../lib/navigation/navItems";
import { overviewTexts } from "../../../texts/overviewTexts";
import GlassBody from "../../glass/GlassBody";
import GlassPair from "../../glass/GlassPair";
import GlassRow from "../../glass/GlassRow";
import GlassSection from "../../glass/GlassSection";
import { GLASS_STACK } from "../../glass/glassStyles";
import FunnelCard from "./FunnelCard";
import OutcomeSection from "./OutcomeSection";
import ProductSection from "./ProductSection";
import TodayHero from "./TodayHero";

const texts = overviewTexts.today;

/** Reiter "Übersicht" (v1 DailyView): mein Tag an der Tür, in der aktiven Sparte. */
export interface TodayTabProps { readonly _?: never; }

export default function TodayTab() {
  const vertical = useVertical();
  const { stats, demo } = useTodayStats(vertical);
  return (
    <GlassBody layout="wide">
      <GlassPair offset="first">
        <TodayHero stats={stats} vertical={vertical} demo={demo} />
        <FunnelCard stats={stats} vertical={vertical} />
      </GlassPair>
      <GlassPair>
        <OutcomeSection stats={stats} vertical={vertical} />
        <div className={GLASS_STACK}>
          <ProductSection groups={stats.groups} />
          <GlassSection footer={demo ? texts.demoFooter : texts.localFooter}>
            <GlassRow icon={MapPinned} tone="red" title={texts.toMap} subtitle={stats.doors === 0 ? texts.noneHint : texts.toMapText} href={HOME_HREF} />
          </GlassSection>
        </div>
      </GlassPair>
    </GlassBody>
  );
}
