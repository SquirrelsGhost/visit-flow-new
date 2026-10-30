import { motion } from "motion/react";
import { riseIn } from "../../lib/motion/presets";
import type { SimulatorKind } from "../../lib/simulator/simulatorTypes";
import { simulatorTexts as t } from "../../texts/simulatorTexts";
import GlassChip from "../glass/GlassChip";

interface SimulatorInfoProps {
  kind: SimulatorKind;
  demo: boolean;
}

/** Schmale Infozeile: Sparte und Demo-Hinweis. Der Seitentitel steht in der Topbar. */
export default function SimulatorInfo({ kind, demo }: SimulatorInfoProps) {
  return (
    <motion.div variants={riseIn} className="flex items-center gap-2 px-1 text-xs font-medium text-[var(--glass-label)]">
      <span className="truncate">{t.info[kind]}</span>
      {demo && (
        <GlassChip tone="amber">{t.demo}</GlassChip>
      )}
    </motion.div>
  );
}
