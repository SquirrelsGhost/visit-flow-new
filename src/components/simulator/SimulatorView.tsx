// Bereich, Profil und Demo-Sitzung kommen aus dem Browser
"use client";

import { useProfile } from "../../hooks/useProfile";
import { useSimulatorTariffs } from "../../hooks/useSimulatorTariffs";
import { useVertical } from "../../hooks/useVertical";
import type { Vertical } from "../../lib/battle/battleCategories";
import { leadRoleFor } from "../../lib/simulator/leadCommission";
import { ENERGY_COMMISSION_READY, nearestMonth } from "../../lib/simulator/simulatorCatalog";
import type { SimulatorKind } from "../../lib/simulator/simulatorTypes";
import GlassPage from "../glass/GlassPage";
import SettingsTabBody from "../settings/SettingsTabBody";
import EnergyPending from "./EnergyPending";
import EnergySimulator from "./EnergySimulator";
import LeadSimulator from "./LeadSimulator";
import SimulatorInfo from "./SimulatorInfo";
import TelcoSimulator from "./TelcoSimulator";

const KIND: Record<Vertical, SimulatorKind> = { telco: "telco", solar: "lead", energy: "energy" };

/**
 * Provisions-Simulator (/provisions-simulator, v1 ProvisionSimulator aus dem Profil). Folgt dem Bereichs-Umschalter:
 * Telco mit Bonus-Staffeln, Lead mit Stufen, Energie mit Strom/Gas (bis zur echten Provision nur ein Hinweis). Vorbelegt mit Vodafone-Monat und Rolle.
 */
export interface SimulatorViewProps { readonly _?: never; }

export default function SimulatorView() {
  const vertical = useVertical();
  const kind = KIND[vertical];
  const { profile, demo } = useProfile();
  const data = useSimulatorTariffs();
  if (!profile) return null;

  return (
    <GlassPage>
      <div className="h-full overflow-y-auto overflow-x-hidden">
        <SettingsTabBody key={kind} layout="wide">
          <SimulatorInfo kind={kind} demo={(demo || data.demo) && (kind !== "energy" || ENERGY_COMMISSION_READY)} />
          {kind === "telco" && <TelcoSimulator data={data} initialMonth={nearestMonth(profile.contractMonth)} />}
          {kind === "lead" && <LeadSimulator initialRole={leadRoleFor(profile.role)} />}
          {kind === "energy" && (ENERGY_COMMISSION_READY ? <EnergySimulator data={data} /> : <EnergyPending />)}
        </SettingsTabBody>
      </div>
    </GlassPage>
  );
}
