import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { assistantContentFor } from "../lib/assistant/verticalAssistant";
import { hasDemoSession } from "../lib/auth/demoSession";
import { coachBriefing, coachContext } from "../lib/coach/coachBriefing";
import type { CoachProfile } from "../lib/coach/coachTypes";
import { answerLocally, greetingFor } from "../lib/copilot/copilotLocal";
import { askWithTools } from "../lib/copilot/copilotConversation";
import { CopilotOffline } from "../lib/copilot/copilotStream";
import { availableTools } from "../lib/copilot/tools/copilotToolAccess";
import type { CopilotAction, CopilotMessage, CopilotPayload, CopilotSource } from "../lib/copilot/copilotTypes";
import { copilotTexts } from "../texts/copilotTexts";
import { useAuth } from "./useAuth";
import { useCopilotFeedback } from "./useCopilotFeedback";
import { useCopilotProposals } from "./useCopilotProposals";
import { useVertical } from "./useVertical";

/** Wie v1: die letzten vier Nachrichten gehen als Verlauf mit. */
const HISTORY = 4;
let counter = 0;
const nextId = () => `c${Date.now().toString(36)}${(counter += 1)}`;

export type CopilotMode = "live" | "local" | "demo";

/**
 * Gespräch mit Enes (v1 AIContext): fragt den Server gestreamt, fällt bei Funkloch, Demo oder
 * Serverfehler auf das Wissen der aktiven Sparte zurück. Enes bedient dabei die App über Werkzeuge
 * (lesen, öffnen, speichern nach Bestätigung).
 */
export function useCopilotChat(onNavigate: (action: CopilotAction) => void, coach: CoachProfile | null) {
  const { user } = useAuth();
  const vertical = useVertical();
  const pathname = usePathname();
  const knowledge = useMemo(() => assistantContentFor(vertical).knowledge, [vertical]);
  const briefing = useMemo(() => (coach ? coachBriefing(coach, vertical) : null), [coach, vertical]);
  const greeting = useCallback((): CopilotMessage => ({ id: nextId(), sender: "ai", text: greetingFor(user, new Date().getHours()), source: "local" }), [user]);
  const [messages, setMessages] = useState<CopilotMessage[]>(() => [greeting()]);
  const [lastSource, setLastSource] = useState<CopilotSource>("live");
  const [busy, setBusy] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const { rate } = useCopilotFeedback(setMessages);
  const { decide } = useCopilotProposals(setMessages);

  useEffect(() => () => abortRef.current?.abort(), []);

  const patch = useCallback((id: string, change: Partial<CopilotMessage>) => {
    setMessages((list) => list.map((m) => (m.id === id ? { ...m, ...change } : m)));
  }, []);

  const replyLocally = useCallback(
    (id: string, text: string) => {
      const reply = answerLocally(text, { user, vertical, knowledge, briefing });
      patch(id, { text: reply.text, actions: reply.actions, pending: false, source: "local" });
      setLastSource("local");
      if (reply.navigate) onNavigate(reply.navigate);
    },
    [user, vertical, knowledge, briefing, patch, onNavigate],
  );

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || busy) return;
      const aiId = nextId();
      const history = messages.filter((m) => !m.pending).slice(-HISTORY).map(({ sender, text: t }) => ({ sender, text: t }));
      setMessages((list) => [...list, { id: nextId(), sender: "user", text }, { id: aiId, sender: "ai", text: "", pending: true }]);
      if (hasDemoSession() || !navigator.onLine) return replyLocally(aiId, text);

      setBusy(true);
      const controller = new AbortController();
      abortRef.current = controller;
      const payload: CopilotPayload = {
        message: text,
        history,
        currentPath: pathname,
        userName: user?.name?.split(" ")[0] ?? "Besucher",
        userRole: user?.role ?? "Unbekannt",
        vertical,
        coach: coach ? coachContext(coach) : undefined,
        tools: availableTools(user, vertical),
      };
      let streamed = "";
      try {
        const { done } = await askWithTools(
          payload,
          { user, vertical, message: text, now: Date.now() },
          {
            onText: (full) => patch(aiId, { text: (streamed = full) }),
            onNavigate,
            onProposals: (proposals) => setMessages((list) => list.map((m) => (m.id === aiId ? { ...m, proposals: [...(m.proposals ?? []), ...proposals] } : m))),
          },
          controller.signal,
        );
        patch(aiId, { text: streamed || copilotTexts.emptyReply, pending: false, source: "live", logId: done?.logId, intent: done?.intent, feedback: null });
        setLastSource("live");
        if (done?.action === "NAVIGATE" && done.path) onNavigate({ label: done.path, href: done.path });
      } catch (error) {
        if (controller.signal.aborted) return;
        if (error instanceof CopilotOffline || !streamed) replyLocally(aiId, text);
        else patch(aiId, { text: `${streamed}\n\n${copilotTexts.interrupted}`, pending: false, source: "live" });
      } finally {
        setBusy(false);
      }
    },
    [busy, messages, pathname, user, vertical, coach, patch, replyLocally, onNavigate],
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setBusy(false);
    setMessages([greeting()]);
  }, [greeting]);

  const mode: CopilotMode = hasDemoSession() ? "demo" : lastSource;
  return { messages, busy, mode, briefing, send, rate, decide, reset };
}
