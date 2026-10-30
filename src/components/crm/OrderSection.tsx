import { motion } from "motion/react";
import type { Vertical } from "../../lib/battle/battleCategories";
import type { Order } from "../../lib/crm/crmTypes";
import { riseIn } from "../../lib/motion/presets";
import { GLASS_CARD, GLASS_LABEL } from "../glass/glassStyles";
import OrderCard, { type OrderHandlers } from "./OrderCard";

interface OrderSectionProps extends OrderHandlers {
  label: string;
  empty: string;
  orders: readonly Order[];
  vertical: Vertical;
  expandedId: string | null;
  onToggle: (id: string) => void;
}

/** Liste mit leiser Überschrift und Anzahl (v1: aktuelle und ältere Sales). */
export default function OrderSection({ label, empty, orders, vertical, expandedId, onToggle, ...handlers }: OrderSectionProps) {
  return (
    <motion.section variants={riseIn} aria-label={label}>
      <h3 className={`${GLASS_LABEL} flex justify-between`}>
        <span>{label}</span>
        <span className="tabular-nums">{orders.length}</span>
      </h3>
      {orders.length === 0 ? (
        <p className={`${GLASS_CARD} px-4 py-5 text-center text-[13.5px] text-muted-foreground`}>{empty}</p>
      ) : (
        <ul className="space-y-2.5">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} vertical={vertical} expanded={expandedId === order.id} onToggle={onToggle} {...handlers} />
          ))}
        </ul>
      )}
    </motion.section>
  );
}
