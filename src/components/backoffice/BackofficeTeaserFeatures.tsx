import { CheckCheck, Layers, PieChart, ShieldCheck, type LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import type { GlassTone } from "../../lib/glass/glassTones";
import { riseIn } from "../../lib/motion/presets";
import { backofficeTexts as t } from "../../texts/backofficeTexts";
import GlassIcon from "../glass/GlassIcon";
import { GLASS_CARD } from "../glass/glassStyles";

const LOOK: readonly { icon: LucideIcon; tone: GlassTone }[] = [
  { icon: CheckCheck, tone: "green" },
  { icon: PieChart, tone: "red" },
  { icon: Layers, tone: "blue" },
  { icon: ShieldCheck, tone: "purple" },
];

/** Vier Nutzen als Kacheln, ab iPad zweispaltig. */
export interface BackofficeTeaserFeaturesProps { readonly _?: never; }

export default function BackofficeTeaserFeatures() {
  return (
    <motion.ul variants={riseIn} className="grid gap-2.5 sm:grid-cols-2">
      {t.teaser.features.map((f, i) => (
        <li key={f.title} className={`${GLASS_CARD} flex gap-3 p-4`}>
          <GlassIcon icon={LOOK[i]!.icon} tone={LOOK[i]!.tone} />
          <span className="min-w-0">
            <span className="block text-[14.5px] font-semibold text-foreground">{f.title}</span>
            <span className="mt-0.5 block text-[12.5px] leading-snug text-muted-foreground">{f.text}</span>
          </span>
        </li>
      ))}
    </motion.ul>
  );
}
