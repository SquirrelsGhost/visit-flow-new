import type { Vertical } from "../battle/battleCategories";
import { ENERGY_SET } from "./energyPortals";
import { telcoPortalSet, type PortalSet } from "./portals";
import { SOLAR_SET } from "./solarPortals";

/** Welche Portale der D2D-Reiter für die gewählte Sparte zeigt. */
export function portalSetFor(vertical: Vertical): PortalSet {
  if (vertical === "energy") return ENERGY_SET;
  if (vertical === "solar") return SOLAR_SET;
  return telcoPortalSet(false);
}
