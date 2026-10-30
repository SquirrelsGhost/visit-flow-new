import { motion } from "motion/react";
import { onStreet, type StreetRef } from "../../lib/streets/streetMatch";
import type { Order, OrderFilter } from "../../lib/crm/crmTypes";
import { riseIn } from "../../lib/motion/presets";
import { crmTexts as t } from "../../texts/crmTexts";
import GlassFilterChips, { type GlassFilterOption } from "../glass/GlassFilterChips";
import GlassSearchField from "../glass/GlassSearchField";
import StreetFilterChip from "../streets/StreetFilterChip";

interface CrmToolbarProps {
  orders: readonly Order[];
  filter: OrderFilter;
  onFilter: (filter: OrderFilter) => void;
  query: string;
  onQuery: (query: string) => void;
  /** Straße aus der Straßenliste; die Zahlen an den Chips zählen dann nur sie. */
  street: StreetRef | null;
  onClearStreet: () => void;
  lead: boolean;
}

/** Straßenfilter (aus der Straßenliste), Statusfilter mit Anzahl und Suche über Kunde, Adresse und Produkt. */
export default function CrmToolbar({ orders: all, filter, onFilter, query, onQuery, street, onClearStreet, lead }: CrmToolbarProps) {
  const orders = street ? all.filter((o) => onStreet(o.address, street)) : all;
  const count = (status: OrderFilter) => (status === "all" ? orders.length : orders.filter((o) => o.status === status).length);
  const options: GlassFilterOption<OrderFilter>[] = [
    { id: "all", label: t.all, count: count("all") },
    { id: "open", label: t.open, count: count("open") },
    { id: "completed", label: lead ? t.approved : t.completed, count: count("completed") },
    { id: "cancelled", label: t.cancelled, count: count("cancelled") },
  ];
  return (
    <motion.div variants={riseIn} className="space-y-3">
      <StreetFilterChip street={street} onClear={onClearStreet} />
      <GlassFilterChips options={options} active={filter} onChange={onFilter} label={t.filterLabel} layoutId="crm-filter" />
      <GlassSearchField value={query} onChange={onQuery} placeholder={t.search} />
    </motion.div>
  );
}
