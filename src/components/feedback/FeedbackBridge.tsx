// Lauscht global auf Berührungen und neue Toasts: braucht den Browser
"use client";

import { useEffect } from "react";
import { toastFeedback, type FeedbackSound } from "../../lib/feedback/feedback";
import { unlockAudio } from "../../lib/feedback/feedbackSynth";
import ConfettiLayer from "./ConfettiLayer";

/** Toast-Art (sonner data-type) → Klang. Info- und Lade-Meldungen bleiben still. */
const TOAST_SOUNDS: Record<string, FeedbackSound> = { success: "success", error: "error", warning: "warning" };

/**
 * Verbindet das Feedback-System mit der App, ohne jede Seite anzufassen:
 * gibt den Ton bei der ersten Berührung frei (iOS) und lässt jede Erfolgs-, Warn- oder Fehlermeldung leise klingen.
 */
export interface FeedbackBridgeProps { readonly _?: never; }

export default function FeedbackBridge() {
  useEffect(() => {
    const unlock = () => unlockAudio();
    window.addEventListener("pointerdown", unlock, { passive: true });
    window.addEventListener("keydown", unlock);

    const observer = new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          // Beim ersten Toast kommt die ganze Liste auf einmal, deshalb auch darin suchen
          const toasts = node.hasAttribute("data-sonner-toast") ? [node] : Array.from(node.querySelectorAll("[data-sonner-toast]"));
          for (const toast of toasts) {
            const sound = TOAST_SOUNDS[toast.getAttribute("data-type") ?? ""];
            if (sound) toastFeedback(sound);
          }
        });
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      observer.disconnect();
    };
  }, []);

  return <ConfettiLayer />;
}
