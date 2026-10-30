// Wechselt die Seiten der Kopfkarte mit motion
"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import type { HeroPhase } from "../../../hooks/useHeroPhase";
import { cn } from "../../../lib/cn";
import { riseIn } from "../../../lib/motion/presets";
import GlassSheen from "../../glass/GlassSheen";
import GlassSpotlight from "../../glass/GlassSpotlight";
import { GLASS_DEEP } from "../../glass/glassStyles";
import HeroParticles from "./HeroParticles";
import HeroRefreshButton from "./HeroRefreshButton";
import HeroTabs from "./HeroTabs";

interface BattleHeroProps {
  phase: HeroPhase;
  onPhase: (phase: HeroPhase) => void;
  onRefresh: () => void;
  arena: ReactNode;
  recap: ReactNode;
}

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Kopf der Battle-Seite als tiefe Glaskarte: oben die Umschaltung Arena ↔ Rückblick,
 * darunter gleitet die gewählte Seite weich herein (die Höhe folgt mit).
 */
export default function BattleHero({ phase, onPhase, onRefresh, arena, recap }: BattleHeroProps) {
  const reduce = useReducedMotion();
  const dir = phase === "arena" ? -1 : 1;
  return (
    <motion.section variants={riseIn} className={cn(GLASS_DEEP, "overflow-clip px-4 pb-5 pt-4 min-[400px]:px-5")}>
      <span aria-hidden className="pointer-events-none absolute -left-24 -top-28 h-72 w-72 rounded-full bg-[radial-gradient(closest-side,rgba(239,68,68,0.45),transparent)]" />
      <span aria-hidden className="pointer-events-none absolute -right-24 -top-20 h-72 w-72 rounded-full bg-[radial-gradient(closest-side,rgba(59,130,246,0.38),transparent)]" />
      <GlassSpotlight />
      <GlassSheen />
      <HeroParticles />
      <div className="relative flex items-center gap-2">
        <HeroTabs phase={phase} onPhase={onPhase} />
        <HeroRefreshButton onRefresh={onRefresh} />
      </div>
      <motion.div layout={!reduce} transition={{ duration: 0.45, ease: EASE }} className="relative overflow-x-clip">
        <AnimatePresence mode="popLayout" initial={false} custom={dir}>
          <motion.div
            key={phase}
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: dir * -28, filter: "blur(6px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, x: dir * 28, filter: "blur(6px)" }}
            transition={{ duration: 0.42, ease: EASE }}
            id={`battle-hero-panel-${phase}`}
            role="tabpanel"
            aria-labelledby={`battle-hero-tab-${phase}`}
          >
            {phase === "arena" ? arena : recap}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.section>
  );
}
