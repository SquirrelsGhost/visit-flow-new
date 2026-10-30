import { type ReadToolName, type ToolArgs, type ToolContext } from "./copilotToolTypes";
import { getBattle, getEarnings, getExpiring, getOrders, getTeamToday } from "./dataReadTools";
import { getAppointments, getOpenDoors, getToday } from "./mapReadTools";
import { findTariff } from "./tariffReadTool";

/** Höchstlänge eines Ergebnisses; der Server kürzt sonst ohnehin. */
const MAX_CHARS = 3800;

const READERS: Record<ReadToolName, (args: ToolArgs, ctx: ToolContext) => unknown> = {
  get_today: (_args, ctx) => getToday(ctx),
  get_open_doors: getOpenDoors,
  get_appointments: getAppointments,
  get_orders: getOrders,
  get_expiring: getExpiring,
  get_earnings: (_args, ctx) => getEarnings(ctx),
  find_tariff: findTariff,
  get_battle: (_args, ctx) => getBattle(ctx),
  get_team_today: (_args, ctx) => getTeamToday(ctx),
};

/** Führt ein Lese-Werkzeug aus; Fehler werden zu "nicht verfügbar", damit Enes trotzdem antwortet. */
export async function runReadTool(name: ReadToolName, args: ToolArgs, ctx: ToolContext): Promise<string> {
  try {
    const result = await READERS[name](args, ctx);
    return JSON.stringify(result).slice(0, MAX_CHARS);
  } catch {
    return JSON.stringify({ error: "nicht verfügbar" });
  }
}
