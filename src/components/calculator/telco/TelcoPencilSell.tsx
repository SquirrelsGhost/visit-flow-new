// Angebotszustand, Speichern und Zwischenablage brauchen den Browser
"use client";

import { Wifi } from "lucide-react";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";
import { useOfferActions } from "../../../hooks/useOfferActions";
import { useTelcoPencilSell } from "../../../hooks/useTelcoPencilSell";
import { offerText } from "../../../lib/tariff/telcoOffer";
import { transferProducts } from "../../../lib/tariff/telcoTransfer";
import { hasTariff } from "../../../lib/tariff/telcoTypes";
import { pencilSellSummaryTexts as s, pencilSellTexts as t } from "../../../texts/pencilSellTexts";
import GlassChip from "../../glass/GlassChip";
import AltCostSection from "./AltCostSection";
import LoyaltyWarnDialog from "./LoyaltyWarnDialog";
import NeuTariffSection from "./NeuTariffSection";
import PortfolioTabs from "./PortfolioTabs";
import SummaryFooter from "./SummaryFooter";

/** Telco-Tarifvergleich aus v1 (TelcoPencilSell) im Glas-Design: heutige Kosten links, Angebot rechts, Ersparnis unten. */
export interface TelcoPencilSellProps { readonly _?: never; }

export default function TelcoPencilSell() {
  const sell = useTelcoPencilSell();
  const { state, meta, quote, actions, secret } = sell;
  const text = useMemo(() => offerText(state, meta, quote), [state, meta, quote]);
  const products = useCallback(() => transferProducts(state, meta, quote), [state, meta, quote]);
  const offer = useOfferActions(text, products);

  const clear = () => {
    actions.clear();
    toast.success(s.cleared);
  };

  return (
    <div className="mx-auto max-w-5xl pb-6">
      <div className="space-y-7">
        <div className="flex items-center gap-2 px-1">
          <GlassChip tone="red">
            <Wifi className="h-3 w-3" /> {meta.title}
          </GlassChip>
          <span className="truncate text-[12px] text-[var(--glass-label)]">{t.title}</span>
        </div>
        <PortfolioTabs value={state.portfolio} onChange={actions.setPortfolio} />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
          <AltCostSection
            alt={state.alt}
            altMonthly={quote.altMonthly}
            onAlt={actions.setAlt}
            onAddSim={actions.addSim}
            onSim={actions.setSim}
            onRemoveSim={actions.removeSim}
            onSecretTap={secret.tap}
          />
          <NeuTariffSection sell={sell} />
        </div>
        <SummaryFooter
          monthsLabel={quote.monthsLabelShort}
          altTotal={quote.altTotal}
          neuTotal={quote.neuTotal}
          ersparnis={quote.ersparnis}
          neuAvg={quote.neuAvg}
          hasTariff={hasTariff(state)}
          onCopy={offer.copy}
          onShare={offer.share}
          onClear={clear}
          onTransfer={offer.transfer}
        />
      </div>
      <LoyaltyWarnDialog open={secret.warn.open} remaining={secret.warn.remaining} onClose={secret.closeWarn} />
    </div>
  );
}
