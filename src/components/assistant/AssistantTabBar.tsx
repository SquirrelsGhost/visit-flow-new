import { Brain, Building2, User, type LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { ASSISTANT_TABS, type AssistantTab } from "../../lib/assistant/assistantTabs";
import { feedback } from "../../lib/feedback/feedback";
import { cn } from "../../lib/cn";
import { SNAPPY_SPRING } from "../../lib/motion/presets";
import { assistantTexts } from "../../texts/assistantTexts";
import { GLASS_SEGMENT_IDLE, GLASS_SEGMENT_PILL } from "../glass/glassStyles";

const ICONS: Record<AssistantTab, LucideIcon> = { assistant: Brain, dashboard: User, tracker: Building2 };

const BAR =
  "glass-surface relative grid grid-cols-3 gap-1 rounded-[22px] p-1.5";
const TAB =
  "relative z-10 flex h-10 items-center justify-center gap-2 rounded-2xl text-sm font-semibold transition-colors duration-300 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

interface AssistantTabBarProps {
  active: AssistantTab;
  onChange: (tab: AssistantTab) => void;
}

/**
 * Reiterleiste KI · Ich · D2D aus v1. Statt drei einzeln umgefärbter Knöpfe gleitet eine rote Pille
 * unter den gewählten Reiter; sie bleibt beim Scrollen oben stehen.
 */
export default function AssistantTabBar({ active, onChange }: AssistantTabBarProps) {
  return (
    <div role="tablist" aria-label={assistantTexts.tabsLabel} className={BAR}>
      {ASSISTANT_TABS.map((tab) => {
        const Icon = ICONS[tab];
        const selected = tab === active;
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            id={`assistant-tab-${tab}`}
            aria-selected={selected}
            aria-controls={`assistant-panel-${tab}`}
            onClick={() => {
              if (selected) return;
              feedback("select");
              onChange(tab);
            }}
            className={cn(TAB, selected ? "text-white" : GLASS_SEGMENT_IDLE)}
          >
            {selected && (
              <motion.span
                layoutId="assistant-tab-pill"
                transition={SNAPPY_SPRING}
                className={`${GLASS_SEGMENT_PILL} -z-10`}
              />
            )}
            <Icon className="h-4 w-4" />
            {assistantTexts.tabs[tab]}
          </button>
        );
      })}
    </div>
  );
}
