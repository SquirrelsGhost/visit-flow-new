import { HOME_HREF } from "../../navigation/navItems";
import { availableNavTargets } from "../../navigation/navTargets";
import { loadTelcoState, saveTelcoState } from "../../tariff/pencilSellStorage";
import { copilotToolTexts } from "../../../texts/copilotToolTexts";
import type { CopilotAction } from "../copilotTypes";
import { MAP_SEARCH_EVENT } from "./copilotEvents";
import { num, str, type OpenToolName, type ToolArgs, type ToolContext } from "./copilotToolTypes";


function pageHref(page: string, ctx: ToolContext): string | null {
  if (page === "map") return HOME_HREF;
  return availableNavTargets(ctx.user, ctx.vertical).find((target) => target.id === page)?.href ?? null;
}

/** Rechner mit dem alten Monatspreis des Kunden vorbelegen (Pencil Sell, Feld Internet + Festnetz). */
function prefillCalculator(oldPrice: number | null): void {
  if (oldPrice === null) return;
  const state = loadTelcoState();
  saveTelcoState({ ...state, alt: { ...state.alt, internetFestnetz: Math.round(oldPrice * 100) / 100 } });
}

/**
 * Führt ein Öffnen-Werkzeug aus und liefert das Ziel. null, wenn der Nutzer die Seite nicht sehen darf;
 * dann sagt das Ergebnis Enes, dass es nicht geklappt hat.
 */
export function runOpenTool(name: OpenToolName, args: ToolArgs, ctx: ToolContext): CopilotAction | null {
  const t = copilotToolTexts;
  switch (name) {
    case "open_page": {
      const page = str(args, "page");
      const href = pageHref(page, ctx);
      return href ? { label: t.pageLabel(page), href } : null;
    }
    case "open_calculator": {
      const href = pageHref("statistics", ctx);
      if (!href) return null;
      prefillCalculator(num(args, "oldPrice"));
      return { label: t.calculator, href };
    }
    case "show_street": {
      const street = str(args, "street");
      if (!street) return null;
      if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(MAP_SEARCH_EVENT, { detail: street }));
      return { label: t.street(street), href: `${HOME_HREF}?q=${encodeURIComponent(street)}` };
    }
    case "open_simulator": {
      const href = pageHref("simulator", ctx);
      return href ? { label: t.simulator, href } : null;
    }
  }
}
