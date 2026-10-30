import { useInView } from "motion/react";
import { useRef } from "react";
import { useEnergySimulator } from "../../hooks/useEnergySimulator";
import { useHeroActions } from "../../hooks/useHeroActions";
import type { SimulatorTariffs } from "../../hooks/useSimulatorTariffs";
import { ENERGY_CATEGORIES } from "../../lib/simulator/simulatorCatalog";
import { tariffsFor } from "../../lib/simulator/simulatorBasket";
import { basketCopyText, unitsText } from "../../lib/simulator/simulatorFormat";
import { buildGoal, goalProducts } from "../../lib/simulator/simulatorGoal";
import { simulatorTexts as t } from "../../texts/simulatorTexts";
import AutopilotGroup from "./AutopilotGroup";
import BasketGroup from "./BasketGroup";
import HeroBreakdown from "./HeroBreakdown";
import GlassSplit from "../glass/GlassSplit";
import ResultHero from "./ResultHero";
import StickyTotal from "./StickyTotal";
import TariffGroup from "./TariffGroup";

interface EnergySimulatorProps {
  data: SimulatorTariffs;
}

/** Energie (Strom und Gas): Tarife antippen, Verträge zählen, Provision sehen. Ohne Bonus-Staffeln, die kennt v1 nicht. */
export default function EnergySimulator({ data }: EnergySimulatorProps) {
  const sim = useEnergySimulator(data.tariffs);
  const actions = useHeroActions();
  const heroRef = useRef<HTMLElement>(null);
  const heroVisible = useInView(heroRef);
  const { products, units, base } = sim.basket;

  const setGoal = () => actions.setGoal(buildGoal({ provision: base, bonus: 0, products: goalProducts(products), contractMonth: 1, totalProducts: units }));

  return (
    <GlassSplit
      sticky
      aside={
        <ResultHero
          heroRef={heroRef}
          label={t.hero.energy}
          total={base}
          empty={products.length === 0}
          goalSaved={actions.goalSaved}
          onCopy={() => actions.copy(basketCopyText(products, base, 0))}
          onGoal={setGoal}
        >
          <HeroBreakdown provision={base} bonus={0} units={unitsText(units, true)} />
        </ResultHero>
      }
    >
      <AutopilotGroup footer={t.autopilot.footer.energy} onRun={sim.runAutopilot} />
      <TariffGroup
        categories={ENERGY_CATEGORIES}
        tariffsFor={(key) => tariffsFor(key, data.tariffs)}
        loading={data.loading}
        footer={data.demo ? t.tariffs.footerDemo : t.tariffs.footerEnergy}
        onAdd={sim.add}
      />
      <BasketGroup basket={sim.basket} contracts />
      <StickyTotal visible={!heroVisible && products.length > 0} total={base} detail={unitsText(units, true)} />
    </GlassSplit>
  );
}
