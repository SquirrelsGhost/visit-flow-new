import { Check, Clock, X } from "lucide-react";
import type { OrderStatus } from "../../lib/crm/crmTypes";
import { crmTexts as t } from "../../texts/crmTexts";
import GlassChip from "../glass/GlassChip";

interface OrderStatusChipProps {
  status: OrderStatus;
  /** Leads heißen nach Pipedrive "Approved" statt "Abgeschlossen" (v1). */
  lead?: boolean;
}

/** Status eines Auftrags als Plakette: offen gelb, abgeschlossen grün, storniert rot. */
export default function OrderStatusChip({ status, lead = false }: OrderStatusChipProps) {
  if (status === "cancelled") {
    return (
      <GlassChip tone="red">
        <X aria-hidden className="h-3 w-3" strokeWidth={2.6} />
        {t.cancelled}
      </GlassChip>
    );
  }
  if (status === "completed") {
    return (
      <GlassChip tone="green">
        <Check aria-hidden className="h-3 w-3" strokeWidth={2.6} />
        {lead ? t.approved : t.completed}
      </GlassChip>
    );
  }
  return (
    <GlassChip tone="amber">
      <Clock aria-hidden className="h-3 w-3" strokeWidth={2.4} />
      {t.open}
    </GlassChip>
  );
}
