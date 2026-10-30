// Bereich, Demo-Sitzung, Aufträge und Dialoge leben im Browser
"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useCrm } from "../../hooks/useCrm";
import { useProfile } from "../../hooks/useProfile";
import { useStreetParam } from "../../hooks/useStreetParam";
import { useVertical } from "../../hooks/useVertical";
import { canComplete, DAYS_UNTIL_COMPLETION, filterOrders, splitByAge } from "../../lib/crm/crmLogic";
import type { Order, OrderFilter } from "../../lib/crm/crmTypes";
import { crmTexts as t } from "../../texts/crmTexts";
import GlassBody from "../glass/GlassBody";
import GlassPage from "../glass/GlassPage";
import GlassSplit from "../glass/GlassSplit";
import CrmDialogs, { type CrmConfirm } from "./CrmDialogs";
import CrmHero from "./CrmHero";
import CrmHints from "./CrmHints";
import CrmLinks from "./CrmLinks";
import CrmSkeleton from "./CrmSkeleton";
import CrmToolbar from "./CrmToolbar";
import OrderSection from "./OrderSection";

/**
 * Aufträge (/crm, v1 CRMPage): Sales und Stornos des Monats mit Stornoquote, darunter alle Aufträge nach
 * Alter. Telco/Energie: wischen zum Stornieren oder Abschließen. Lead: nur Anzeige, Status kommt aus Pipedrive.
 */
export interface CrmViewProps { readonly _?: never; }

export default function CrmView() {
  const vertical = useVertical();
  const { profile, demo } = useProfile();
  const crm = useCrm(vertical);
  const [filter, setFilter] = useState<OrderFilter>("all");
  const [query, setQuery] = useState("");
  const link = useStreetParam();
  const [street, setStreet] = useState(link.street);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<CrmConfirm | null>(null);
  const lead = vertical === "solar";

  const shown = useMemo(() => splitByAge(filterOrders(crm.orders, filter, query, street), vertical), [crm.orders, filter, query, street, vertical]);
  const filtered = filter !== "all" || query.trim() !== "" || street !== null;
  const clearStreet = () => {
    setStreet(null);
    link.clear();
  };

  const complete = (order: Order) => {
    if (!canComplete(order)) return void toast.error(t.tooEarly(DAYS_UNTIL_COMPLETION - order.daysSince));
    void crm.run({ kind: "complete", ids: order.products.filter((p) => p.status === "open").map((p) => p.id) });
  };
  const handlers = {
    onCancel: (order: Order) => setConfirm({ kind: "cancel", order }),
    onComplete: complete,
    onDiscard: (order: Order) => setConfirm({ kind: "discard", order }),
    onCancelProduct: (order: Order, product: Order["products"][number]) => setConfirm({ kind: "product", order, product }),
  };
  const confirmed = async (c: CrmConfirm) => {
    const ok =
      c.kind === "product"
        ? await crm.run({ kind: "cancel", ids: [c.product.id], product: true })
        : await crm.run({ kind: c.kind, ids: c.order.products.map((p) => p.id) });
    if (ok) setConfirm(null);
  };
  const section = (age: "recent" | "older") => (
    <OrderSection
      label={age === "recent" ? t.recent[vertical] : t.older[vertical]}
      empty={filtered ? t.noMatch : age === "recent" ? t.noneRecent : t.noneOlder}
      orders={shown[age]}
      vertical={vertical}
      expandedId={expandedId}
      onToggle={(id) => setExpandedId((cur) => (cur === id ? null : id))}
      {...handlers}
    />
  );

  return (
    <GlassPage>
      <div className="h-full overflow-y-auto overflow-x-hidden overscroll-contain">
        {crm.loading ? (
          <div className="mx-auto max-w-xl px-4 pt-5">
            <CrmSkeleton />
          </div>
        ) : (
          <GlassBody key={vertical} layout="wide">
            <GlassSplit
              sticky
              aside={
                <>
                  <CrmHero counts={crm.counts} vertical={vertical} demo={demo} contractMonth={profile?.contractMonth ?? null} />
                  <CrmToolbar orders={crm.orders} filter={filter} onFilter={setFilter} query={query} onQuery={setQuery} street={street} onClearStreet={clearStreet} lead={lead} />
                </>
              }
            >
              {section("recent")}
              {section("older")}
              {crm.orders.length > 0 && <CrmHints lead={lead} />}
              <CrmLinks vertical={vertical} />
            </GlassSplit>
          </GlassBody>
        )}
      </div>
      <CrmDialogs confirm={confirm} busy={crm.busy} onClose={() => setConfirm(null)} onConfirm={(c) => void confirmed(c)} />
    </GlassPage>
  );
}
