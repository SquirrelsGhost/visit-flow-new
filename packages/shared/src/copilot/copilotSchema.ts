import { z } from "zod";
import { COPILOT_TOOL_NAMES } from "./copilotTools";

export const COPILOT_VERTICALS = ["telco", "energy", "solar"] as const;
export const COACH_WEAK_SPOTS = ["notMet", "noInterest", "supplied", "closing"] as const;

/**
 * Coach-Profil, das die App auf dem Gerät aus den eigenen Türen rechnet. Nur Kennzahlen:
 * keine Straßen, keine Kundennamen. Fehlt es, antwortet Enes allgemein.
 */
export const coachContextSchema = z
  .object({
    doors28: z.number().int().min(0).max(100_000),
    hitRate: z.number().min(0).max(100),
    salesRate: z.number().min(0).max(100),
    salesTrend: z.number().int().min(-10_000).max(10_000),
    bestWindow: z.string().regex(/^\d{1,2}-\d{1,2}$/).nullable(),
    weakSpot: z.enum(COACH_WEAK_SPOTS).nullable(),
    topCategory: z.string().max(40).nullable(),
    rareCategory: z.string().max(40).nullable(),
    streakDays: z.number().int().min(0).max(3650),
    today: z.object({ doors: z.number().int().min(0).max(10_000), sales: z.number().int().min(0).max(10_000) }).strict(),
    learning: z.boolean(),
  })
  .strict();

export type CoachContext = z.infer<typeof coachContextSchema>;

/** Höchstens so viele Werkzeug-Runden pro Frage; danach muss Enes antworten. */
export const MAX_TOOL_ROUNDS = 3;

const toolCallSchema = z.object({ id: z.string().min(1).max(64), name: z.enum(COPILOT_TOOL_NAMES), arguments: z.string().max(2000) }).strict();
const toolResultSchema = z.object({ id: z.string().min(1).max(64), content: z.string().max(4000) }).strict();

/** Eine abgeschlossene Werkzeug-Runde: Text und Aufrufe von Enes, Ergebnisse aus der App. */
const toolRoundSchema = z
  .object({
    text: z.string().max(2000).default(""),
    calls: z.array(toolCallSchema).min(1).max(4),
    results: z.array(toolResultSchema).max(4),
  })
  .strict();

export type CopilotToolRound = z.infer<typeof toolRoundSchema>;

const historyItemSchema = z.object({ sender: z.enum(["user", "ai"]), text: z.string().max(4000) }).strict();

/**
 * Body von POST /api/copilot/chat(-stream). Felder wie der v1-Client (message, history, currentPath,
 * userName, userRole) plus Sparte und Coach-Profil. Die Rolle kommt immer aus dem Token, nie aus dem Body.
 */
export const copilotChatInputSchema = z
  .object({
    message: z.string().trim().min(1).max(2000),
    history: z.array(historyItemSchema).max(20).default([]),
    currentPath: z.string().max(200).default("/"),
    userName: z.string().max(60).optional(),
    userRole: z.string().max(40).optional(),
    vertical: z.enum(COPILOT_VERTICALS).default("telco"),
    coach: coachContextSchema.optional(),
    /** Werkzeuge, die die App für diesen Nutzer ausführen kann (Rolle und Sparte schon geprüft). */
    tools: z.array(z.enum(COPILOT_TOOL_NAMES)).max(COPILOT_TOOL_NAMES.length).default([]),
    /** Bisherige Runden dieser Frage, wenn die App Werkzeug-Ergebnisse nachreicht. */
    toolRounds: z.array(toolRoundSchema).max(MAX_TOOL_ROUNDS).default([]),
  })
  .strict();

export type CopilotChatInput = z.infer<typeof copilotChatInputSchema>;

/** 👍/👎 zu einer Antwort (v1 POST /copilot/feedback). */
export const copilotFeedbackSchema = z
  .object({
    logId: z.string().regex(/^[a-f\d]{24}$/i),
    feedback: z.enum(["up", "down"]),
    reason: z.string().max(500).optional(),
  })
  .strict();

export const copilotMemoryParamsSchema = z.object({ id: z.string().regex(/^[a-f\d]{24}$/i) }).strict();

export const COACH_MEMORY_KINDS = ["preference", "fact", "win", "weakspot"] as const;
export type CoachMemoryKind = (typeof COACH_MEMORY_KINDS)[number];

/** Eine Erinnerung, wie die Seite "Was Enes über mich weiß" sie zeigt. */
export interface CoachMemoryView {
  id: string;
  kind: CoachMemoryKind;
  content: string;
  createdAt: string;
}
