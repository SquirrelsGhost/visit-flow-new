// Aufklappen, Wischen und Höhen-Animation brauchen den Browser
"use client";

import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef } from "react";
import type { Vertical } from "../../lib/battle/battleCategories";
import { cn } from "../../lib/cn";
import { canComplete, DAYS_UNTIL_COMPLETION, isEditable, LEAD_DAYS } from "../../lib/crm/crmLogic";
import { formatEuro } from "../../lib/crm/crmFormat";
import type { Order, OrderProduct } from "../../lib/crm/crmTypes";
import { SOFT_SPRING } from "../../lib/motion/presets";
import { crmTexts as t } from "../../texts/crmTexts";
import { GLASS_CARD } from "../glass/glassStyles";
import OrderDetails from "./OrderDetails";
import OrderStatusChip from "./OrderStatusChip";
import OrderSwipe from "./OrderSwipe";

export interface OrderHandlers {
  onCancel: (order: Order) => void;
  onComplete: (order: Order) => void;
  onDiscard: (order: Order) => void;
  onCancelProduct: (order: Order, product: OrderProduct) => void;
}

interface OrderCardProps extends OrderHandlers {
  order: Order;
  vertical: Vertical;
  expanded: boolean;
  onToggle: (id: string) => void;
}

const STRIPE = { open: "bg-amber-400", completed: "bg-emerald-500", cancelled: "bg-red-500" } as const;

/** Frist unter dem Alter: Telco bis zum Abschluss, Lead bis Pipedrive entscheidet (v1 SaleCard). */
function deadline(order: Order, lead: boolean): string | null {
  if (order.status !== "open") return null;
  if (lead) return LEAD_DAYS - order.daysSince > 0 ? t.leadOpen(LEAD_DAYS - order.daysSince) : t.leadExpired;
  return order.daysSince < DAYS_UNTIL_COMPLETION ? t.untilCompletion(DAYS_UNTIL_COMPLETION - order.daysSince) : null;
}

/** Ein Auftrag als Glaskarte: farbiger Statusstreifen, Kunde, Provision, Alter; tippen klappt die Details auf. */
export default function OrderCard({ order, vertical, expanded, onToggle, ...handlers }: OrderCardProps) {
  const lead = vertical === "solar";
  const editable = isEditable(order, vertical);
  const dragging = useRef(false);
  const due = deadline(order, lead);
  const title = lead ? order.address || order.customerName : order.customerName;

  return (
    <motion.li layout="position" transition={SOFT_SPRING} className="list-none">
      <OrderSwipe enabled={editable} onCancel={() => handlers.onCancel(order)} onComplete={() => handlers.onComplete(order)} onDragging={(d) => (dragging.current = d)}>
        <article className={cn(GLASS_CARD, "relative")}>
          <span aria-hidden className={cn("absolute inset-y-3 left-0 w-1 rounded-r-full", STRIPE[order.status])} />
          <button
            type="button"
            aria-expanded={expanded}
            aria-label={`${title} – ${expanded ? t.collapse : t.expand}`}
            onClick={() => !dragging.current && onToggle(order.id)}
            className="flex w-full items-start gap-3 py-3.5 pl-5 pr-4 text-left focus:outline-none focus-visible:bg-[var(--glass-hover)]"
          >
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[15px] font-semibold tracking-[-0.01em] text-foreground">{title}</span>
              <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <OrderStatusChip status={order.status} lead={lead} />
                {order.customerType && !lead && <span className="text-[12px] text-muted-foreground">{order.customerType}</span>}
                {!lead && <span className="text-[12px] text-muted-foreground">{t.productCount(order.products.length)}</span>}
              </span>
            </span>
            <span className="shrink-0 text-right">
              <span className={cn("block text-[15px] font-semibold tabular-nums", order.status === "cancelled" ? "text-muted-foreground line-through" : "text-emerald-600 dark:text-emerald-400")}>
                {order.totalCommission > 0 ? formatEuro(order.totalCommission) : "–"}
              </span>
              <span className="mt-0.5 block text-[12px] text-muted-foreground">{order.daysSince === 0 ? t.today : t.daysAgo(order.daysSince)}</span>
              {due && <span className="mt-0.5 block text-[11.5px] font-medium text-amber-600 dark:text-amber-400">{due}</span>}
            </span>
            <ChevronDown aria-hidden className={cn("mt-1 h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300 dark:text-white/35", expanded && "rotate-180")} />
          </button>
          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div key="details" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={SOFT_SPRING} className="overflow-hidden">
                <OrderDetails
                  order={order}
                  editable={editable}
                  completable={canComplete(order)}
                  onCancel={() => handlers.onCancel(order)}
                  onComplete={() => handlers.onComplete(order)}
                  onDiscard={() => handlers.onDiscard(order)}
                  onCancelProduct={(p) => handlers.onCancelProduct(order, p)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </article>
      </OrderSwipe>
    </motion.li>
  );
}
