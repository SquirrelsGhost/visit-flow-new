import { motion } from "motion/react";
import { riseIn } from "../../../lib/motion/presets";
import type { TodayStats } from "../../../lib/overview/todayStats";
import { overviewTexts } from "../../../texts/overviewTexts";
import { GLASS_CARD, GLASS_LABEL } from "../../glass/glassStyles";
import ProductTile from "./ProductTile";

interface ProductSectionProps {
  groups: TodayStats["groups"];
}

const texts = overviewTexts.today;

/** Verkaufte Produkte je Gruppe der Sparte; wie in v1 erscheinen nur Gruppen mit Verkäufen. */
export default function ProductSection({ groups }: ProductSectionProps) {
  const sold = groups.filter((g) => g.count > 0);
  return (
    <motion.section variants={riseIn} className="flex flex-col">
      <h3 className={GLASS_LABEL}>{texts.products}</h3>
      <div className={`${GLASS_CARD} flex-1 p-3`}>
        {sold.length === 0 ? (
          <p className="px-2 py-4 text-center text-[13px] text-muted-foreground">{texts.productsEmpty}</p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {sold.map((g) => (
              <ProductTile key={g.category} category={g.category} count={g.count} />
            ))}
          </div>
        )}
      </div>
    </motion.section>
  );
}
