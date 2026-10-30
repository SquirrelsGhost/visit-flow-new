import { useHeroActions } from "../../hooks/useHeroActions";
import { useLeadSimulator } from "../../hooks/useLeadSimulator";
import { leadCopyText } from "../../lib/simulator/simulatorFormat";
import { buildGoal } from "../../lib/simulator/simulatorGoal";
import type { LeadRole } from "../../lib/simulator/simulatorTypes";
import { simulatorTexts as t } from "../../texts/simulatorTexts";
import LeadCountGroup from "./LeadCountGroup";
import LeadHeroDetails from "./LeadHeroDetails";
import LeadModelGroup from "./LeadModelGroup";
import LeadRoleGroup from "./LeadRoleGroup";
import GlassSplit from "../glass/GlassSplit";
import ResultHero from "./ResultHero";

interface LeadSimulatorProps {
  initialRole: LeadRole;
}

/** Lead (TrioHeim): Stufe und Netto-Leads wählen, Provision und Rechenweg sehen (v1 Reiter "Leads"). */
export default function LeadSimulator({ initialRole }: LeadSimulatorProps) {
  const sim = useLeadSimulator(initialRole);
  const actions = useHeroActions();
  const setGoal = () =>
    actions.setGoal(
      buildGoal({ provision: sim.result.total, bonus: 0, products: [{ name: "Lead", category: "Solar_PV", quantity: sim.count }], contractMonth: 1, totalProducts: sim.count }),
    );
  return (
    <GlassSplit
      sticky
      aside={
        <ResultHero
          label={t.hero.lead}
          total={sim.result.total}
          goalSaved={actions.goalSaved}
          onCopy={() => actions.copy(leadCopyText(sim.role, sim.count, sim.result))}
          onGoal={setGoal}
        >
          <LeadHeroDetails role={sim.role} count={sim.count} result={sim.result} />
        </ResultHero>
      }
    >
      <LeadRoleGroup role={sim.role} onChange={sim.setRole} />
      <LeadCountGroup sim={sim} />
      <LeadModelGroup role={sim.role} />
    </GlassSplit>
  );
}
