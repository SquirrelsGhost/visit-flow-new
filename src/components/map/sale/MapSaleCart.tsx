import { Minus, Plus, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { SaleCategory } from "../../../lib/map/saleCatalog";
import type { SaleProduct } from "../../../lib/map/saleProducts";
import { SNAPPY_SPRING } from "../../../lib/motion/presets";
import { STEP_LABEL } from "../steps/stepStyles";

interface MapSaleCartProps {
  cart: SaleProduct[];
  categories: SaleCategory[];
  onOpenCategory: (category: SaleCategory) => void;
  onQuantity: (index: number, delta: number) => void;
  onRemove: (index: number) => void;
}

const ROUND = "grid h-8 min-h-0 w-8 min-w-0 shrink-0 place-items-center rounded-lg transition active:scale-90 disabled:opacity-40";

/** Produkt-Kacheln und gewählte Produkte mit Menge (v1 SaleDialog Kategorien + "Ausgewählte Produkte"). */
export default function MapSaleCart({ cart, categories, onOpenCategory, onQuantity, onRemove }: MapSaleCartProps) {
  const total = cart.reduce((n, p) => n + p.quantity, 0);
  const categoryOf = (id: string) => categories.find((c) => c.id === id);

  return (
    <>
      <div>
        <span className={STEP_LABEL}>Produkt hinzufügen</span>
        <div className="grid grid-cols-3 gap-2">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onOpenCategory(c)}
              className="glass-surface flex min-h-[72px] flex-col items-center justify-center gap-1 rounded-[24px] text-xs font-bold text-slate-800 transition-all duration-200 hover:shadow-md active:scale-95 dark:text-white"
            >
              <span className="grid h-8 w-8 place-items-center rounded-xl text-base" style={{ background: `${c.color}26` }}>
                {c.icon}
              </span>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {cart.length > 0 && (
        <div>
          <span className={STEP_LABEL}>Ausgewählte Produkte ({total})</span>
          <ul className="space-y-2">
            <AnimatePresence initial={false}>
              {cart.map((p, i) => (
                <motion.li
                  key={`${p.category}-${p.type}-${i}`}
                  layout
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -24, transition: { duration: 0.18 } }}
                  transition={SNAPPY_SPRING}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-2.5 dark:border-white/10 dark:bg-white/5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 break-words text-[13px] font-semibold leading-snug text-slate-900 dark:text-white">{p.type}</p>
                    <p className="text-[11px] text-slate-500 dark:text-white/50">
                      {categoryOf(p.category)?.icon ?? "📦"} {categoryOf(p.category)?.label ?? p.category}
                    </p>
                  </div>
                  <button type="button" aria-label="Weniger" className={`${ROUND} bg-card dark:bg-white/10`} disabled={p.quantity <= 1} onClick={() => onQuantity(i, -1)}>
                    <Minus size={14} />
                  </button>
                  <span className="w-4 text-center text-sm font-extrabold tabular-nums text-slate-900 dark:text-white">{p.quantity}</span>
                  <button type="button" aria-label="Mehr" className={`${ROUND} bg-card dark:bg-white/10`} onClick={() => onQuantity(i, 1)}>
                    <Plus size={14} />
                  </button>
                  <button type="button" aria-label="Entfernen" className={`${ROUND} text-red-500`} onClick={() => onRemove(i)}>
                    <X size={15} />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>
      )}
    </>
  );
}
