import { useInView } from "motion/react";
import { useRef } from "react";
import { useHeroActions } from "../../hooks/useHeroActions";
import type { SimulatorTariffs } from "../../hooks/useSimulatorTariffs";
import { useStornoQuote } from "../../hooks/useStornoQuote";
import { useTelcoSimulator } from "../../hooks/useTelcoSimulator";
import { TELCO_CATEGORIES } from "../../lib/simulator/simulatorCatalog";
import { tariffsFor } from "../../lib/simulator/simulatorBasket";
import { basketCopyText, unitsText } from "../../lib/simulator/simulatorFormat";
import { buildGoal, goalProducts } from "../../lib/simulator/simulatorGoal";
import { fill } from "../../texts/profileTexts";
import { simulatorTexts as t } from "../../texts/simulatorTexts";
import AutopilotGroup from "./AutopilotGroup";
import BasketGroup from "./BasketGroup";
import BonusGroup from "./BonusGroup";
import HeroBreakdown from "./HeroBreakdown";
import LevelGroup from "./LevelGroup";
import MonthGroup from "./MonthGroup";
import GlassSplit from "../glass/GlassSplit";
import ResultHero from "./ResultHero";
import StickyTotal from "./StickyTotal";
import TariffGroup from "./TariffGroup";

interface TelcoSimulatorProps {
  data: SimulatorTariffs;
  initialMonth: number;
}

/** Telco (Vodafone): Vertragsmonat, Level, Autopilot, Tarife, Warenkorb, Bonus-Staffeln (v1 1:1). */
export default function TelcoSimulator({ data, initialMonth }: TelcoSimulatorProps) {
  const quote = useStornoQuote("telco");
  const sim = useTelcoSimulator(data.tariffs, initialMonth, quote);
  const actions = useHeroActions();
  const heroRef = useRef<HTMLElement>(null);
  const heroVisible = useInView(heroRef);
  const { products, units } = sim.basket;
  const total = sim.provision + sim.bonus.total;
  const levelNote = sim.hasLevel && sim.level !== "regulaer" ? fill(t.hero.level, { level: t.level.bonus[sim.level] }) : undefined;

  const setGoal = () =>
    actions.setGoal(buildGoal({ provision: sim.provision, bonus: sim.bonus.total, products: goalProducts(products), contractMonth: sim.month, totalProducts: units }));

  return (
    <GlassSplit
      sticky
      aside={
        <ResultHero
          heroRef={heroRef}
          label={t.hero.telco}
          total={total}
          empty={products.length === 0}
          goalSaved={actions.goalSaved}
          onCopy={() => actions.copy(basketCopyText(products, sim.provision, sim.bonus.total))}
          onGoal={setGoal}
        >
          <HeroBreakdown provision={sim.provision} bonus={sim.bonus.total} levelNote={levelNote} units={unitsText(units)} />
        </ResultHero>
      }
    >
      <MonthGroup month={sim.month} onChange={sim.setMonth} />
      {sim.hasLevel && <LevelGroup level={sim.level} onLevel={sim.setLevel} stornoOk={sim.stornoOk} onToggleStorno={sim.toggleStorno} quote={quote} />}
      <AutopilotGroup footer={t.autopilot.footer.telco} onRun={sim.runAutopilot} />
      <TariffGroup
        categories={TELCO_CATEGORIES}
        tariffsFor={(key) => tariffsFor(key, data.tariffs)}
        loading={data.loading}
        footer={data.demo ? t.tariffs.footerDemo : t.tariffs.footerTelco}
        onAdd={sim.add}
      />
      <BasketGroup basket={sim.basket} />
      {products.length > 0 && <BonusGroup month={sim.month} bonus={sim.bonus} />}
      <StickyTotal visible={!heroVisible && products.length > 0} total={total} detail={unitsText(units)} />
    </GlassSplit>
  );
}
