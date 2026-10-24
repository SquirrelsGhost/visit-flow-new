import type { CoachMemoryView, CopilotChatInput } from "@visit-flow/shared/copilotSchema";
import type { CopilotExchange } from "./CopilotLogRepository";
import type { LlmMessage } from "./llm/LlmClient";
import type { Sanitizer } from "./copilotSanitizer";
import { MARKERS, OBJECTIONS, PERSONA, PRIVACY, profileText, ROLEPLAY, STORNO, VERTICALS } from "./texts/copilotPrompts";

export interface PromptContext {
  input: CopilotChatInput;
  role: string;
  memories: readonly CoachMemoryView[];
  liked: readonly CopilotExchange[];
  now: Date;
  sanitizer: Sanitizer;
}

/** So viele Zeichen Verlauf gehen höchstens mit (v1: token-basiertes Limit). */
const HISTORY_CHARS = 6000;
const LIKED_CHARS = 600;

function memoryText(memories: readonly CoachMemoryView[], sanitizer: Sanitizer): string {
  if (memories.length === 0) return "GEDÄCHTNIS: Noch nichts gespeichert.";
  const lines = memories.map((m) => `- (${m.kind}) ${sanitizer.outbound(m.content)}`);
  return `GEDÄCHTNIS (was du über ihn weißt, neueste zuerst):\n${lines.join("\n")}`;
}

/** 👍-Antworten als Stilvorlage: so hat Enes diesem Berater schon geholfen (v1 Few-Shot). */
function likedText(liked: readonly CopilotExchange[], sanitizer: Sanitizer): string {
  if (liked.length === 0) return "";
  const examples = liked.map((l) => sanitizer.outbound(`Frage: ${l.question.slice(0, 200)}\nAntwort: ${l.reply.slice(0, LIKED_CHARS)}`));
  return `ANTWORTEN, DIE IHM GEHOLFEN HABEN (Stil und Tiefe beibehalten):\n${examples.join("\n---\n")}`;
}

function situation(ctx: PromptContext): string {
  const time = ctx.now.toLocaleString("de-DE", { weekday: "long", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin" });
  return `SITUATION: ${time}, Rolle ${ctx.role}, gerade auf der Seite ${ctx.input.currentPath}.`;
}

/** Ältere Nachrichten fallen zuerst weg, bis der Verlauf ins Budget passt. */
function trimmedHistory(ctx: PromptContext): LlmMessage[] {
  const out: LlmMessage[] = [];
  let used = 0;
  for (const item of [...ctx.input.history].reverse()) {
    used += item.text.length;
    if (used > HISTORY_CHARS) break;
    out.unshift({ role: item.sender === "user" ? "user" : "assistant", content: ctx.sanitizer.outbound(item.text) });
  }
  return out;
}

/**
 * Baut die Nachrichten an das Modell: fester Teil zuerst (gut für Prompt-Caching), dann Sparte,
 * Profil, Gedächtnis und Beispiele des Beraters, dann Verlauf und Frage. Alles, was vom Nutzer stammt,
 * läuft durch den Sanitizer; der feste Text nicht, damit dort nichts versehentlich geschwärzt wird.
 */
export function buildCopilotMessages(ctx: PromptContext): LlmMessage[] {
  const system = [
    PERSONA,
    PRIVACY,
    OBJECTIONS,
    ROLEPLAY,
    STORNO,
    MARKERS,
    VERTICALS[ctx.input.vertical] ?? "",
    situation(ctx),
    profileText(ctx.input.coach),
    memoryText(ctx.memories, ctx.sanitizer),
    likedText(ctx.liked, ctx.sanitizer),
  ]
    .filter(Boolean)
    .join("\n\n");
  return [
    { role: "system", content: system },
    ...trimmedHistory(ctx),
    { role: "user", content: ctx.sanitizer.outbound(ctx.input.message) },
  ];
}
