import { Home, Settings2, Trophy, Users, type LucideIcon } from "lucide-react";
import type { OverviewTab } from "../../lib/overview/overviewTabs";
import { overviewTexts } from "../../texts/overviewTexts";
import GlassSegmented from "../glass/GlassSegmented";
import { GLASS_TAB_BAR } from "../glass/glassStyles";

interface OverviewTabBarProps {
  tabs: readonly OverviewTab[];
  active: OverviewTab;
  onChange: (tab: OverviewTab) => void;
  /** Beschriftung des Struktur-Reiters je Rolle und Sparte. */
  structureLabel: string;
}

const ICONS: Record<OverviewTab, LucideIcon> = { team: Users, manage: Settings2, structure: Users, today: Home, contest: Trophy };
const texts = overviewTexts.tabs;

/** Reiterleiste der Übersicht; erscheint nur, wenn die Rolle mehr als einen Reiter hat. */
export default function OverviewTabBar({ tabs, active, onChange, structureLabel }: OverviewTabBarProps) {
  const label = (tab: OverviewTab) => (tab === "structure" ? structureLabel : tab === "manage" ? texts.manage : tab === "team" ? texts.team : tab === "contest" ? texts.contest : texts.today);
  return (
    <div className={GLASS_TAB_BAR}>
      <GlassSegmented label={overviewTexts.tabsLabel} idPrefix="overview" segments={tabs.map((id) => ({ id, label: label(id), icon: ICONS[id] }))} active={active} onChange={onChange} />
    </div>
  );
}
