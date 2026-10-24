import type { CoachMemoryView, CopilotChatInput } from "@visit-flow/shared/copilotSchema";
import type { AuthUser } from "../../lib/auth/accessToken";
import { HttpError, notFound } from "../../lib/http/HttpError";
import type { CoachMemoryRepository } from "./CoachMemoryRepository";
import type { CopilotLogRepository } from "./CopilotLogRepository";
import { createMarkerFilter, type CopilotMarkers } from "./copilotMarkers";
import { explicitMemory } from "./copilotMemoryRules";
import { buildCopilotMessages } from "./copilotPrompt";
import { createSanitizer, redactPii } from "./copilotSanitizer";
import type { LlmClient } from "./llm/LlmClient";

/** So viele Erinnerungen und 👍-Beispiele gehen höchstens in den Prompt. */
const PROMPT_MEMORIES = 20;
const PROMPT_LIKED = 3;
/** Obergrenze für die Seite "Was Enes über mich weiß". */
const LIST_MEMORIES = 200;

export interface CopilotDeps {
  /** null, wenn kein Sprachmodell konfiguriert ist: Dann antwortet die App mit lokalem Wissen. */
  llm: LlmClient | null;
  memories: CoachMemoryRepository;
  logs: CopilotLogRepository;
  now?: () => Date;
}

/** Abschluss einer Antwort, Felder wie das v1-Event "done". */
export interface CopilotResult {
  reply: string;
  logId: string;
  intent: "chat";
  action: "NAVIGATE" | "NONE";
  path: string | null;
  /** Was Enes sich aus diesem Gespräch neu gemerkt hat. */
  remembered: CoachMemoryView[];
}

const unavailable = () => new HttpError(503, "Enes ist gerade nicht erreichbar");
const sameText = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/**
 * Enes als persönlicher D2D-Coach: baut den Prompt aus Profil, Gedächtnis und 👍-Beispielen,
 * streamt die Antwort, filtert Steuerzeichen heraus und lernt dabei dazu (Merk-Wünsche und
 * Marker des Modells). Nichts verlässt den Server ungeschwärzt.
 */
export class CopilotService {
  private readonly now: () => Date;

  constructor(private readonly deps: CopilotDeps) {
    this.now = deps.now ?? (() => new Date());
  }

  /** Wirft 503, wenn kein Modell konfiguriert ist; der Stream prüft das, bevor er Header sendet. */
  assertAvailable(): void {
    if (!this.deps.llm) throw unavailable();
  }

  async chat(user: AuthUser, input: CopilotChatInput, onToken: (text: string) => void, signal?: AbortSignal): Promise<CopilotResult> {
    const llm = this.deps.llm;
    if (!llm) throw unavailable();
    const remembered: CoachMemoryView[] = [];
    const wish = explicitMemory(input.message);
    if (wish) remembered.push(await this.deps.memories.add(user.id, "preference", redactPii(wish), "user"));

    const [memories, liked] = await Promise.all([
      this.deps.memories.list(user.id, PROMPT_MEMORIES),
      this.deps.logs.liked(user.id, input.vertical, PROMPT_LIKED),
    ]);
    const sanitizer = createSanitizer(input.userName?.split(/\s+/)[0]);
    const messages = buildCopilotMessages({ input, role: user.role, memories, liked, now: this.now(), sanitizer });

    const filter = createMarkerFilter();
    let reply = "";
    const emit = (raw: string) => {
      if (!raw) return;
      const text = sanitizer.inbound(raw);
      reply += text;
      onToken(text);
    };
    for await (const chunk of llm.stream(messages, signal)) emit(filter.push(chunk));
    emit(filter.end());

    remembered.push(...(await this.rememberMarkers(user.id, filter.markers, memories)));
    const logId = await this.deps.logs.insert(user.id, input.vertical, { question: redactPii(input.message), reply });
    const path = filter.markers.nav;
    return { reply, logId, intent: "chat", action: path ? "NAVIGATE" : "NONE", path, remembered };
  }

  /** Marker [[MERKEN:…]] des Modells, ohne Doppelte und ohne personenbezogene Freitexte. */
  private async rememberMarkers(userId: string, markers: CopilotMarkers, known: readonly CoachMemoryView[]): Promise<CoachMemoryView[]> {
    const saved: CoachMemoryView[] = [];
    for (const item of markers.remember) {
      const content = redactPii(item.content);
      if ([...known, ...saved].some((m) => sameText(m.content, content))) continue;
      saved.push(await this.deps.memories.add(userId, item.kind, content, "enes"));
    }
    return saved;
  }

  async feedback(user: AuthUser, logId: string, feedback: "up" | "down", reason?: string): Promise<{ saved: true }> {
    const found = await this.deps.logs.setFeedback(user.id, logId, feedback, reason ? redactPii(reason) : undefined);
    if (!found) throw notFound("Antwort nicht gefunden");
    return { saved: true };
  }

  memories(user: AuthUser): Promise<CoachMemoryView[]> {
    return this.deps.memories.list(user.id, LIST_MEMORIES);
  }

  async forget(user: AuthUser, id: string): Promise<{ deleted: true }> {
    if (!(await this.deps.memories.remove(user.id, id))) throw notFound("Erinnerung nicht gefunden");
    return { deleted: true };
  }

  /** "Alles vergessen": Gedächtnis und Gesprächsprotokoll (v1 /erase-ai-data). */
  async forgetAll(user: AuthUser): Promise<{ memories: number; conversations: number }> {
    const [memories, conversations] = await Promise.all([this.deps.memories.removeAll(user.id), this.deps.logs.deleteForUser(user.id)]);
    return { memories, conversations };
  }
}
