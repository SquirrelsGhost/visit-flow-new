// Rolle, Reiterwahl und Wischen brauchen den Browser
"use client";

import { useState, type ReactNode } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useContests } from "../../hooks/useContests";
import { useVertical } from "../../hooks/useVertical";
import type { Vertical } from "../../lib/battle/battleCategories";
import type { Contest } from "../../lib/overview/contestTypes";
import { overviewTabsFor, structureLabelKey, type OverviewTab } from "../../lib/overview/overviewTabs";
import { overviewTexts } from "../../texts/overviewTexts";
import AssistantSlider from "../assistant/AssistantSlider";
import GlassPage from "../glass/GlassPage";
import OverviewTabBar from "./OverviewTabBar";
import ContestTab from "./contest/ContestTab";
import ManageTab from "./manage/ManageTab";
import StructureTab from "./structure/StructureTab";
import AdminTeamTab from "./team/AdminTeamTab";
import TodayTab from "./today/TodayTab";

interface TabContext {
  contests: readonly Contest[];
  allContests: readonly Contest[];
  role: string;
  vertical: Vertical;
}

/** Reiter, die schon aus v1 übernommen sind; die übrigen folgen Schritt für Schritt. */
const CONTENT: Partial<Record<OverviewTab, (ctx: TabContext) => ReactNode>> = {
  team: (ctx) => <AdminTeamTab key={ctx.vertical} vertical={ctx.vertical} contests={ctx.allContests} />,
  manage: (ctx) => <ManageTab key={ctx.vertical} vertical={ctx.vertical} contests={ctx.allContests} />,
  structure: (ctx) => <StructureTab key={ctx.vertical} vertical={ctx.vertical} contests={ctx.allContests} lens={ctx.role === "mentor" ? "mentor" : "structure"} />,
  today: () => <TodayTab />,
  contest: (ctx) => <ContestTab contests={ctx.contests} vertical={ctx.vertical} />,
};

/**
 * Übersicht (/daily-view, v1 SwipeableDailyView): Tageszahlen in der Mitte, links Verwaltung bzw. Struktur
 * für Führungsrollen (Admins: ein Reiter "Team"), rechts das laufende Gewinnspiel. Auf dem Handy wechseln die Reiter per Wischen.
 */
export interface OverviewViewProps { readonly _?: never; }

export default function OverviewView() {
  const { user } = useAuth();
  const vertical = useVertical();
  const role = user?.role ?? "berater";
  const { all, contests } = useContests(user?.id, typeof user?.teamId === "string" ? user.teamId : undefined, vertical);
  const tabs = overviewTabsFor(role, contests.length > 0).filter((tab) => CONTENT[tab]);
  const [active, setActive] = useState<OverviewTab>("today");
  const [visited, setVisited] = useState<ReadonlySet<OverviewTab>>(() => new Set(["today"]));
  const current = tabs.includes(active) ? active : "today";
  const index = tabs.indexOf(current);

  const select = (next: OverviewTab) => {
    setVisited((seen) => (seen.has(next) ? seen : new Set(seen).add(next)));
    setActive(next);
  };

  return (
    <GlassPage>
      <div className="h-full overflow-y-auto overflow-x-hidden overscroll-contain">
        {tabs.length > 1 && (
          <OverviewTabBar tabs={tabs} active={current} onChange={select} structureLabel={overviewTexts.tabs[structureLabelKey(role, vertical === "solar")]} />
        )}
        <AssistantSlider
          index={index}
          onIndexChange={(i) => select(tabs[i] ?? current)}
          panels={tabs.map((tab) => (
            <section key={tab} id={`overview-panel-${tab}`} role="tabpanel" aria-labelledby={`overview-tab-${tab}`}>
              {visited.has(tab) && CONTENT[tab]?.({ contests, allContests: all, vertical, role })}
            </section>
          ))}
        />
      </div>
    </GlassPage>
  );
}
