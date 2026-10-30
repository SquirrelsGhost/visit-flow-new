// Offener Zustand, Gespräch und Navigation leben im Browser
"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useCoachProfile } from "../../hooks/useCoachProfile";
import { useCopilotChat } from "../../hooks/useCopilotChat";
import { useUserSettings } from "../../hooks/useUserSettings";
import { useVertical } from "../../hooks/useVertical";
import { useWideScreen } from "../../hooks/useWideScreen";
import { copilotSuggestions } from "../../lib/copilot/copilotSuggestions";
import type { CopilotAction } from "../../lib/copilot/copilotTypes";
import CopilotBriefing from "./CopilotBriefing";
import CopilotButton from "./CopilotButton";
import CopilotComposer from "./CopilotComposer";
import CopilotHeader from "./CopilotHeader";
import CopilotMessages from "./CopilotMessages";
import CopilotPanel from "./CopilotPanel";
import CopilotSuggestions from "./CopilotSuggestions";

/** Kurz warten, damit die Antwort "Ich öffne …" lesbar ist, bevor die Seite wechselt (v1: 1,2 s). */
const NAVIGATE_DELAY_MS = 900;

/**
 * AI-Copilot Enes auf allen Seiten (v1 AICopilotProvider + AICopilotWidget): schwebender Knopf,
 * Chat als Sheet bzw. angedocktes Panel. Abschaltbar unter Einstellungen › Persönlich.
 */
export interface CopilotProps { readonly _?: never; }

export default function Copilot() {
  const { settings } = useUserSettings();
  const { user } = useAuth();
  const vertical = useVertical();
  const pathname = usePathname();
  const router = useRouter();
  const wide = useWideScreen();
  const labelId = useId();
  const [open, setOpen] = useState(false);
  // Zählt bei jedem Öffnen hoch, damit das Coach-Profil die neuesten Türen mitnimmt
  const [opened, setOpened] = useState(0);
  const coach = useCoachProfile(opened);
  const timer = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  const close = useCallback(() => setOpen(false), []);
  const navigate = useCallback(
    (action: CopilotAction) => {
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        router.push(action.href);
        // Auf dem Handy verdeckt das Sheet die Seite, also schließen; am iPad bleibt der Chat daneben offen
        if (!wide) setOpen(false);
      }, NAVIGATE_DELAY_MS);
    },
    [router, wide],
  );
  const openNow = useCallback(
    (action: CopilotAction) => {
      router.push(action.href);
      if (!wide) setOpen(false);
    },
    [router, wide],
  );

  const { messages, busy, mode, briefing, send, rate, decide, reset } = useCopilotChat(navigate, coach);
  const prompts = useMemo(() => copilotSuggestions(pathname, vertical, user), [pathname, vertical, user]);
  const fresh = messages.length === 1;

  if (!settings.showAiAssistant) return null;
  return (
    <>
      <CopilotButton
        hidden={open}
        onOpen={() => {
          setOpened((n) => n + 1);
          setOpen(true);
        }}
      />
      <CopilotPanel open={open} onClose={close} labelId={labelId}>
        <CopilotHeader labelId={labelId} mode={mode} onRestart={reset} onClose={close} />
        <CopilotMessages messages={messages} onRate={rate} onOpen={openNow} onDecide={(message, proposal, yes) => void decide(message.id, proposal, yes)}>
          {fresh && briefing && <CopilotBriefing briefing={briefing} onPractice={send} />}
          {fresh && <CopilotSuggestions prompts={prompts} onPick={send} />}
        </CopilotMessages>
        <CopilotComposer busy={busy} onSend={send} />
      </CopilotPanel>
    </>
  );
}
