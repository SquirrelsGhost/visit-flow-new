import { Target } from "lucide-react";
import type { ProductCategory } from "../../../lib/map/productMeta";
import { PRODUCT_GROUP_META, categoryLabel } from "../../../lib/overview/productGroups";
import { contestFormTexts as texts } from "../../../texts/contestFormTexts";
import GlassIcon from "../../glass/GlassIcon";
import { GLASS_CARD, GLASS_DIVIDER, GLASS_FOOTER, GLASS_LABEL, GLASS_TITLE } from "../../glass/glassStyles";
import NumberStepper from "./NumberStepper";

interface ContestGoalFieldsProps {
  categories: readonly string[];
  targets: Record<string, number>;
  onChange: (targets: Record<string, number>) => void;
}

/** Ziel je Produktgruppe als Stepper; nur Gruppen mit Ziel zählen im Gewinnspiel. */
export default function ContestGoalFields({ categories, targets, onChange }: ContestGoalFieldsProps) {
  return (
    <section>
      <h3 className={GLASS_LABEL}>{texts.goals}</h3>
      <div className={`${GLASS_CARD} ${GLASS_DIVIDER}`}>
        {categories.map((category) => {
          const meta = PRODUCT_GROUP_META[category as ProductCategory];
          const label = categoryLabel(category);
          return (
            <div key={category} className="flex items-center gap-3.5 px-4 py-2.5">
              <GlassIcon icon={meta?.icon ?? Target} tone={meta?.tone ?? "red"} />
              <span className={`${GLASS_TITLE} min-w-0 flex-1 truncate`}>{label}</span>
              <NumberStepper label={label} value={targets[category] ?? 0} max={999} onChange={(value) => onChange({ ...targets, [category]: value })} />
            </div>
          );
        })}
      </div>
      <p className={GLASS_FOOTER}>{texts.goalsHint}</p>
    </section>
  );
}
