// Gleitende Markierung der Reiter mit motion
"use client";

import { History, Swords } from "lucide-react";
import { motion } from "motion/react";
import type { HeroPhase } from "../../../hooks/useHeroPhase";
import { cn } from "../../../lib/cn";
import { feedback } from "../../../lib/feedback/feedback";
import { SNAPPY_SPRING } from "../../../lib/motion/presets";
import { battleTexts as t } from "../../../texts/battleTexts";

interface HeroTabsProps {
  phase: HeroPhase;
  onPhase: (phase: HeroPhase) => void;
}

const TABS = [
  { id: "arena", label: t.tabArena, icon: Swords },
  { id: "recap", label: t.tabRecap, icon: History },
] as const;

/** Glas-Umschalter auf der dunklen Kopfkarte: Arena von heute oder Rückblick. */
export default function HeroTabs({ phase, onPhase }: HeroTabsProps) {
  return (
    <div role="tablist" aria-label={t.heroTabsLabel} className="flex flex-1 gap-1 rounded-full bg-white/[0.07] p-1 ring-1 ring-inset ring-white/10">
      {TABS.map(({ id, label, icon: Icon }) => {
        const selected = phase === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            id={`battle-hero-tab-${id}`}
            aria-selected={selected}
            aria-controls={`battle-hero-panel-${id}`}
            onClick={() => {
              if (id !== phase) feedback("select");
              onPhase(id);
            }}
            className={cn(
              "relative flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full text-[13px] font-semibold transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
              selected ? "text-white" : "text-white/55 hover:text-white/85",
            )}
          >
            {selected && (
              <motion.span
                layoutId="battle-hero-pill"
                transition={SNAPPY_SPRING}
                className="absolute inset-0 rounded-full bg-white/[0.16] shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_6px_16px_-8px_rgba(0,0,0,0.6)] ring-1 ring-inset ring-white/15"
              />
            )}
            <Icon aria-hidden className="relative h-4 w-4" />
            <span className="relative">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
