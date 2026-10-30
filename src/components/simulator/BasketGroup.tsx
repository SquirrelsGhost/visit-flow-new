import { ShoppingBag } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { SimBasket } from "../../hooks/useSimBasket";
import { cn } from "../../lib/cn";
import { riseIn } from "../../lib/motion/presets";
import { simulatorTexts as t } from "../../texts/simulatorTexts";
import { GROUP_CARD, GROUP_LABEL, ROW_DIVIDER } from "../settings/settingsStyles";
import BasketRow from "./BasketRow";
import UnitsLabel from "./UnitsLabel";

interface BasketGroupProps {
  basket: SimBasket;
  /** Energie zählt Verträge statt Produkte */
  contracts?: boolean;
}

/** Der Warenkorb als Gruppe; rechts in der Überschrift "Leeren". */
export default function BasketGroup({ basket, contracts = false }: BasketGroupProps) {
  const { products, units } = basket;
  return (
    <motion.section variants={riseIn}>
      <div className="flex items-end justify-between px-1 pb-2.5">
        <h3 className={cn(GROUP_LABEL, "p-0")}>
          {t.basket.label} · <UnitsLabel count={units} contracts={contracts} />
        </h3>
        {products.length > 0 && (
          <button type="button" onClick={basket.clear} className="text-[13px] font-semibold text-red-600 transition-opacity dark:text-red-400 hover:opacity-80">
            {t.basket.clear}
          </button>
        )}
      </div>
      <div className={cn(GROUP_CARD, ROW_DIVIDER, "[&>*+*]:before:left-4")}>
        {products.length === 0 && (
          <p className="flex flex-col items-center gap-2 px-4 py-7 text-[13px] text-muted-foreground">
            <ShoppingBag aria-hidden className="h-6 w-6 opacity-40" />
            {t.basket.empty}
          </p>
        )}
        <AnimatePresence initial={false}>
          {products.map((p) => (
            <BasketRow key={p.id} product={p} onChange={(delta) => basket.change(p.id, delta)} />
          ))}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
