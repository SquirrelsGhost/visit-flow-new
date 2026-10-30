import type { AuthUser } from "@/shared/auth/authSchemas";
import type { Role } from "@/shared/auth/roles";
import type { Vertical } from "../../battle/battleCategories";
import { availableNavTargets } from "../../navigation/navTargets";
import { hasAnyRole } from "../../navigation/userMenuItems";
import { CONFIRM_TOOLS, OPEN_TOOLS, READ_TOOLS, type CopilotToolKind, type CopilotToolName } from "./copilotToolTypes";

const LEAD_ROLES: readonly Role[] = ["admin", "gebietsmanager", "teamleiter", "strukturleiter", "mentor"];

/** Welche Seite ein Werkzeug braucht; ohne Zugriff darauf bietet die App es nicht an. */
const NEEDS_PAGE: Partial<Record<CopilotToolName, string>> = {
  get_orders: "crm",
  get_earnings: "simulator",
  find_tariff: "statistics",
  open_calculator: "statistics",
  open_simulator: "simulator",
  get_battle: "battle",
  challenge_colleague: "battle",
  set_day_status: "daily-status",
};

export function kindOf(name: CopilotToolName): CopilotToolKind {
  if ((READ_TOOLS as readonly string[]).includes(name)) return "read";
  return (OPEN_TOOLS as readonly string[]).includes(name) ? "open" : "confirm";
}

/** Werkzeuge, die die App diesem Nutzer in dieser Sparte anbietet (dieselben Regeln wie die Navigation). */
export function availableTools(user: AuthUser | null, vertical: Vertical): CopilotToolName[] {
  const pages = new Set(availableNavTargets(user, vertical).map((target) => target.id));
  const lead = user !== null && hasAnyRole(user, LEAD_ROLES);
  return [...READ_TOOLS, ...OPEN_TOOLS, ...CONFIRM_TOOLS].filter((name) => {
    if (name === "get_team_today") return lead;
    if (name === "open_calculator" && vertical !== "telco") return false;
    const page = NEEDS_PAGE[name];
    return !page || pages.has(page);
  });
}
