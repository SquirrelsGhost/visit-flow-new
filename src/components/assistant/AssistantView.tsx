// Reiterwahl, Wischen und Speicher im Tab brauchen den Browser
"use client";

import { useState, type ReactNode } from "react";
import { useAssistantTab } from "../../hooks/useAssistantTab";
import { ASSISTANT_TABS, type AssistantTab } from "../../lib/assistant/assistantTabs";
import AiTab from "./ai/AiTab";
import AssistantSlider from "./AssistantSlider";
import AssistantTabBar from "./AssistantTabBar";
import D2dTab from "./d2d/D2dTab";
import MeTab from "./me/MeTab";

const CONTENT: Record<AssistantTab, () => ReactNode> = {
  assistant: () => <AiTab />,
  dashboard: () => <MeTab />,
  tracker: () => <D2dTab />,
};

/**
 * Seite "Assistent" (v1 PatternAnalysisDemoPage): Reiter KI, Ich und D2D.
 * Ein Reiter wird erst beim ersten Besuch aufgebaut und bleibt danach stehen, damit das Wischen flüssig bleibt.
 */
export interface AssistantViewProps { readonly _?: never; }

export default function AssistantView() {
  const { tab, setTab } = useAssistantTab();
  const [visited, setVisited] = useState<ReadonlySet<AssistantTab>>(() => new Set([tab]));
  const index = ASSISTANT_TABS.indexOf(tab);

  const select = (next: AssistantTab) => {
    setVisited((seen) => (seen.has(next) ? seen : new Set(seen).add(next)));
    setTab(next);
  };

  return (
    <div className="h-full w-full overflow-x-hidden overflow-y-auto overscroll-contain">
      <div className="mx-auto w-full max-w-3xl px-2 pb-32 md:px-6 lg:max-w-6xl lg:px-8">
        <div className="sticky top-0 z-20 -mx-2 bg-background/80 px-3 pt-3 pb-3 backdrop-blur-xl md:-mx-6 md:px-6 md:pt-4 lg:-mx-8 lg:px-8">
          <AssistantTabBar active={tab} onChange={select} />
        </div>
        <AssistantSlider
          index={index}
          onIndexChange={(i) => select(ASSISTANT_TABS[i] ?? tab)}
          panels={ASSISTANT_TABS.map((t) => (
            <section key={t} id={`assistant-panel-${t}`} role="tabpanel" aria-labelledby={`assistant-tab-${t}`} className="pt-4 pb-4">
              {visited.has(t) && CONTENT[t]()}
            </section>
          ))}
        />
      </div>
    </div>
  );
}
