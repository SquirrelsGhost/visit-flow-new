import type { TelcoPencilSell } from "../../../hooks/useTelcoPencilSell";
import { hasTariff } from "../../../lib/tariff/telcoTypes";
import { pencilSellTexts as t } from "../../../texts/pencilSellTexts";
import AnimatedEuro from "../../ui/AnimatedEuro";
import Reveal from "../../ui/Reveal";
import DiscountToggles from "./DiscountToggles";
import DowngradeSelect from "./DowngradeSelect";
import FestnetzOptions from "./FestnetzOptions";
import InternetSelect from "./InternetSelect";
import LoyaltySelect from "./LoyaltySelect";
import MobileSection from "./MobileSection";
import PricingCards from "./PricingCards";
import RouterSelect from "./RouterSelect";
import SectionCard from "./SectionCard";
import TvOptionsSection from "./TvOptionsSection";

interface NeuTariffSectionProps {
  sell: TelcoPencilSell;
}

/** Rechte Spalte: das neue Angebot von Internet bis Mobile, Rabatte und Monatspreise. */
export default function NeuTariffSection({ sell }: NeuTariffSectionProps) {
  const { state: s, quote, actions } = sell;
  return (
    <SectionCard tone="green" emoji="✨" title={t.neu} badge={<AnimatedEuro value={quote.neuAvg} suffix={t.perMonthShort} className="before:content-['Ø_']" />}>
      <div className="grid min-w-0 grid-cols-1 gap-2 lg:grid-cols-2 lg:gap-3">
        <InternetSelect sell={sell} />
        <DowngradeSelect sell={sell} />
      </div>
      <div className="space-y-2">
        <LoyaltySelect sell={sell} />
        <Reveal show={hasTariff(s)}>
          <div className="space-y-2">
            <FestnetzOptions festnetzId={s.festnetzId} onSelect={(festnetzId) => actions.patch({ festnetzId })} />
            <RouterSelect sell={sell} />
          </div>
        </Reveal>
        <TvOptionsSection sell={sell} />
        <MobileSection sell={sell} />
        <DiscountToggles sell={sell} />
        <PricingCards sell={sell} />
      </div>
    </SectionCard>
  );
}
