import { useEffect, useState } from "react";
import { hasDemoSession } from "../lib/auth/demoSession";
import type { Challenge } from "../lib/battle/battleTypes";
import { feedback } from "../lib/feedback/feedback";

const DEMO_POPUP_KEY = "vf_demo_battle_popup";
const DEMO_POPUP_DELAY = 2500;

interface ReceivedDetail {
  challengeId: string;
  challengerId: string;
  challengerName: string;
}

/**
 * Popup "Herausforderung!" bei einer neuen Herausforderung (Socket-Ereignis wie in v1).
 * In der Demo erscheint es einmal pro Tab für die offene Beispiel-Herausforderung.
 */
export function useIncomingChallenge(me: { id: string; name?: string } | null, pending: Challenge[], onReceived: () => void) {
  const [incoming, setIncoming] = useState<Challenge | null>(null);

  useEffect(() => {
    const onEvent = (e: Event) => {
      const d = (e as CustomEvent<ReceivedDetail>).detail;
      const now = new Date();
      setIncoming({
        id: d.challengeId,
        challengerId: d.challengerId,
        challengerName: d.challengerName,
        opponentId: me?.id ?? "",
        opponentName: me?.name ?? "",
        status: "pending",
        challengerScore: 0,
        opponentScore: 0,
        date: now.toISOString().split("T")[0],
        createdAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + 30 * 60 * 1000).toISOString(),
      });
      feedback("challenge");
      onReceived();
    };
    window.addEventListener("battle-challenge-received", onEvent);
    return () => window.removeEventListener("battle-challenge-received", onEvent);
  }, [me?.id, me?.name, onReceived]);

  const demoCandidate = pending[0];
  useEffect(() => {
    if (!demoCandidate || !hasDemoSession()) return;
    try {
      if (window.sessionStorage.getItem(DEMO_POPUP_KEY)) return;
      window.sessionStorage.setItem(DEMO_POPUP_KEY, "1");
    } catch {
      return;
    }
    const t = setTimeout(() => setIncoming(demoCandidate), DEMO_POPUP_DELAY);
    return () => clearTimeout(t);
  }, [demoCandidate]);

  return { incoming, dismissIncoming: () => setIncoming(null) };
}
