import { motion } from "motion/react";
import type { Portal, PortalSection } from "../../../lib/assistant/portals";
import { cn } from "../../../lib/cn";
import { riseIn, staggerParent } from "../../../lib/motion/presets";
import PortalTile from "./PortalTile";

interface PortalSectionViewProps {
  section: PortalSection;
  portals: readonly Portal[];
  onOpen: (p: Portal) => void;
}

/** Abschnitt mit farbigem Punkt und Kachelraster (v1 PortalSection). */
export default function PortalSectionView({ section, portals, onOpen }: PortalSectionViewProps) {
  if (portals.length === 0) return null;
  return (
    <motion.section variants={riseIn} className="space-y-3" aria-labelledby={`portal-section-${section.id}`}>
      <div className="flex items-center gap-2 px-1">
        <span className={cn("h-1.5 w-1.5 rounded-full", section.dot)} aria-hidden />
        <h3 id={`portal-section-${section.id}`} className="text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
          {section.title}
        </h3>
      </div>
      <motion.div className="grid grid-cols-2 gap-3 md:grid-cols-3" variants={staggerParent(0.04, 0)}>
        {portals.map((p) => (
          <PortalTile key={p.id} portal={p} onOpen={onOpen} />
        ))}
      </motion.div>
    </motion.section>
  );
}
