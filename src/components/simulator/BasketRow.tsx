import { motion } from "motion/react";
import { cn } from "../../lib/cn";
import { SOFT_SPRING } from "../../lib/motion/presets";
import type { SimProduct } from "../../lib/simulator/simulatorTypes";
import { eur } from "../../lib/tariff/eur";
import { ROW, ROW_SUBTITLE, ROW_TITLE } from "../settings/settingsStyles";
import QuantityStepper from "./QuantityStepper";
import { MONEY } from "./simulatorStyles";

interface BasketRowProps {
  product: SimProduct;
  onChange: (delta: number) => void;
}

/** Ein Posten: Name und Kategorie, Menge, Provision der Zeile. Kommt weich herein und gleitet beim Entfernen weg. */
export default function BasketRow({ product, onChange }: BasketRowProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={SOFT_SPRING}
      className="overflow-hidden"
    >
      <div className={cn(ROW, "gap-2.5")}>
        <span className="min-w-0 flex-1">
          <span className={cn(ROW_TITLE, "truncate")}>{product.name}</span>
          <span className={ROW_SUBTITLE}>{product.category}</span>
        </span>
        <QuantityStepper name={product.name} quantity={product.quantity} onChange={onChange} />
        <span className={cn("w-[5.5rem] shrink-0 text-right text-[14px] font-semibold text-emerald-600 dark:text-emerald-400", MONEY)}>
          +{eur(product.commission * product.quantity)}
        </span>
      </div>
    </motion.div>
  );
}
