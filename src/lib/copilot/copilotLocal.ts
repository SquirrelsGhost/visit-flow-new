import type { AuthUser } from "@/shared/auth/authSchemas";
import { copilotTexts } from "../../texts/copilotTexts";
import { splitSteps } from "../assistant/knowledgeBase";
import type { CoachBriefing } from "../coach/coachBriefing";
import type { KnowledgeItem } from "../assistant/knowledgeTypes";
import type { Vertical } from "../battle/battleCategories";
import { availableNavTargets } from "../navigation/navTargets";
import { pageIntent } from "./copilotIntents";
import { hitCount, tokensOf, wordHits } from "./copilotMatch";
import type { CopilotReply } from "./copilotTypes";

export interface LocalContext {
  user: AuthUser | null;
  vertical: Vertical;
  knowledge: readonly KnowledgeItem[];
  /** Persönliches Briefing; beantwortet "wie läuft's", "meine Quote" auch ohne Server. */
  briefing?: CoachBriefing | null;
}

/** Fragen nach dem eigenen Stand. */
const SELF_WORDS = ["briefing", "quote", "quoten", "statistik", "stand", "laeufts", "laeuft", "bilanz", "zahlen", "schwaeche", "staerke"];

function asksForSelf(text: string): boolean {
  return tokensOf(text).some((token) => SELF_WORDS.some((word) => wordHits(token, word)));
}

function briefingText(briefing: CoachBriefing): string {
  const lines = briefing.lines.map((line) => `• ${line}`);
  if (briefing.focus) lines.push("", `**${copilotTexts.focusLabel}:** ${briefing.focus.text}`);
  return [`**${briefing.title}**`, ...lines].join("\n");
}

/** Ab so viel Punkten gilt ein Eintrag als Antwort (z. B. ein Treffer im Titel). */
const MIN_SCORE = 3;

/** Titel zählt dreifach, Schlagworte doppelt, Text einfach. */
function score(item: KnowledgeItem, tokens: readonly string[]): number {
  return hitCount(tokens, item.title) * 3 + hitCount(tokens, item.tags.join(" ")) * 2 + hitCount(tokens, item.content);
}

export function bestKnowledge(knowledge: readonly KnowledgeItem[], text: string): KnowledgeItem | null {
  const tokens = tokensOf(text);
  if (tokens.length === 0) return null;
  let best: KnowledgeItem | null = null;
  let bestScore = MIN_SCORE - 1;
  for (const item of knowledge) {
    const value = score(item, tokens);
    if (value > bestScore) {
      best = item;
      bestScore = value;
    }
  }
  return best;
}

/** Eintrag als Chat-Antwort: Titel fett, Einleitung, dann die Schritte. */
function knowledgeText(item: KnowledgeItem): string {
  const { intro, steps } = splitSteps(item.content);
  const parts = [`**${item.title}**`];
  if (intro) parts.push(intro);
  if (steps) parts.push(`**${copilotTexts.stepsLabel}:**\n${steps}`);
  return parts.join("\n\n");
}

const assistantHref = (ctx: LocalContext) => availableNavTargets(ctx.user, ctx.vertical).find((t) => t.id === "assistant")?.href;

/**
 * Antwort ohne Server (Demo, Funkloch, KI aus): erst "öffne …", dann die Wissensdatenbank der Sparte,
 * sonst ein Hinweis mit Beispielen. Ersetzt den v1-Offline-Fallschirm mit festen Sprüchen.
 */
export function answerLocally(text: string, ctx: LocalContext): CopilotReply {
  const page = pageIntent(text, ctx.user, ctx.vertical);
  if (page) return { text: copilotTexts.navigating(page.label), navigate: page };
  if (ctx.briefing && asksForSelf(text)) return { text: briefingText(ctx.briefing) };
  const item = bestKnowledge(ctx.knowledge, text);
  if (!item) return { text: copilotTexts.noMatch };
  const href = assistantHref(ctx);
  return { text: knowledgeText(item), actions: href ? [{ label: copilotTexts.openKnowledge, href }] : undefined };
}

/** Begrüßung nach Tageszeit, ohne Serveraufruf (v1 holte sie per [SYSTEM_INIT] vom Server). */
export function greetingFor(user: AuthUser | null, hour: number): string {
  const name = user?.name?.split(" ")[0] || "Champion";
  const { morning, day, evening } = copilotTexts.daytime;
  const daytime = hour < 11 ? morning : hour < 18 ? day : evening;
  return copilotTexts.greeting(name, daytime);
}
