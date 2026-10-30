// Rolle, Reiter und Wischen brauchen den Browser
"use client";

import { Activity, List, Trash2, type LucideIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useStreetPeople } from "../../hooks/useStreetData";
import { hasDemoSession } from "../../lib/auth/demoSession";
import { canOpenStreetList, streetScopeFor } from "../../lib/streets/streetScope";
import type { StreetTab, StreetView } from "../../lib/streets/streetTypes";
import { streetListTexts } from "../../texts/streetListTexts";
import AssistantSlider from "../assistant/AssistantSlider";
import GlassPage from "../glass/GlassPage";
import GlassSegmented from "../glass/GlassSegmented";
import { GLASS_TAB_BAR } from "../glass/glassStyles";
import ActivityTab from "./ActivityTab";
import DeletionsTab from "./DeletionsTab";
import StreetNoAccess from "./StreetNoAccess";
import StreetsTab from "./StreetsTab";

interface StreetListViewProps {
  view: StreetView;
}

const ICONS: Record<StreetTab, LucideIcon> = { deletions: Trash2, streets: List, activity: Activity };

/**
 * Straßenliste für Admin, Strukturleiter (Team-Straßenliste) und Mentor: eine Seite, die Sicht kommt aus der Route.
 * Wie v1 drei bzw. zwei Reiter (Lösch-Anfragen nur Admin, Straßen, Aktivität), auf dem Handy per Wischen.
 */
export default function StreetListView({ view }: StreetListViewProps) {
  const { user } = useAuth();
  const people = useStreetPeople(view);
  const [active, setActive] = useState<StreetTab>("streets");
  const [visited, setVisited] = useState<ReadonlySet<StreetTab>>(() => new Set(["streets"]));
  if (!user) return null;
  if (!canOpenStreetList(view, user)) return <StreetNoAccess view={view} />;

  const scope = streetScopeFor(view, user, hasDemoSession());
  const select = (tab: StreetTab) => {
    setVisited((seen) => (seen.has(tab) ? seen : new Set(seen).add(tab)));
    setActive(tab);
  };
  const panels: Record<StreetTab, () => ReactNode> = {
    deletions: () => <DeletionsTab />,
    streets: () => <StreetsTab scope={scope} people={people} />,
    activity: () => <ActivityTab scope={scope} people={people} />,
  };

  return (
    <GlassPage>
      <div className="h-full overflow-y-auto overflow-x-hidden overscroll-contain">
        <div className={GLASS_TAB_BAR}>
          <GlassSegmented
            label={streetListTexts.tabsLabel}
            idPrefix="streets"
            segments={scope.tabs.map((id) => ({ id, label: streetListTexts.tabs[id], icon: ICONS[id] }))}
            active={active}
            onChange={select}
          />
        </div>
        <AssistantSlider
          index={scope.tabs.indexOf(active)}
          onIndexChange={(i) => select(scope.tabs[i] ?? active)}
          panels={scope.tabs.map((tab) => (
            <section key={tab} id={`streets-panel-${tab}`} role="tabpanel" aria-labelledby={`streets-tab-${tab}`}>
              {visited.has(tab) && panels[tab]()}
            </section>
          ))}
        />
      </div>
    </GlassPage>
  );
}
