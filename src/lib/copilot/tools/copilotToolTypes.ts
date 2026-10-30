import type { AuthUser } from "@/shared/auth/authSchemas";
import type { Vertical } from "../../battle/battleCategories";

/**
 * Werkzeuge, mit denen Enes die App bedient (Spiegel des Katalogs in der v2-API, copilotTools).
 * read: Kennzahlen für Enes · open: öffnet sofort etwas · confirm: speichert erst nach "Ja, mach".
 */
export type CopilotToolKind = "read" | "open" | "confirm";

export const READ_TOOLS = ["get_today", "get_open_doors", "get_appointments", "get_orders", "get_expiring", "get_earnings", "find_tariff", "get_battle", "get_team_today"] as const;
export const OPEN_TOOLS = ["open_page", "open_calculator", "show_street", "open_simulator"] as const;
export const CONFIRM_TOOLS = ["schedule_appointment", "set_day_status", "challenge_colleague"] as const;

export type ReadToolName = (typeof READ_TOOLS)[number];
export type OpenToolName = (typeof OPEN_TOOLS)[number];
export type ConfirmToolName = (typeof CONFIRM_TOOLS)[number];
export type CopilotToolName = ReadToolName | OpenToolName | ConfirmToolName;

export type ToolArgs = Record<string, unknown>;

/** Aufruf, wie der Server ihn im Event "tool_calls" schickt. */
export interface CopilotToolCall {
  id: string;
  name: CopilotToolName;
  kind: CopilotToolKind;
  args: ToolArgs;
  /** Originaltext der Argumente, geht in der nächsten Runde unverändert zurück. */
  arguments: string;
}

/** Abgeschlossene Runde, die die App mit der nächsten Anfrage zurückschickt. */
export interface CopilotToolRound {
  text: string;
  calls: { id: string; name: CopilotToolName; arguments: string }[];
  results: { id: string; content: string }[];
}

/** Was ein Werkzeug über den Nutzer wissen darf. */
export interface ToolContext {
  user: AuthUser | null;
  vertical: Vertical;
  /** Die Frage im Klartext; bleibt auf dem Gerät (z. B. um die Tür eines Termins zu finden). */
  message: string;
  now: number;
}

export type ProposalState = "pending" | "running" | "done" | "failed" | "cancelled";

/** Ein Vorschlag von Enes, der erst nach Bestätigung gespeichert wird. */
export interface CopilotProposal {
  id: string;
  name: ConfirmToolName;
  args: ToolArgs;
  title: string;
  detail: string;
  state: ProposalState;
  /** Rückmeldung nach dem Ausführen. */
  note?: string;
}

export const str = (args: ToolArgs, key: string) => (typeof args[key] === "string" ? (args[key] as string).trim() : "");
export const num = (args: ToolArgs, key: string) => (typeof args[key] === "number" && Number.isFinite(args[key]) ? (args[key] as number) : null);
