import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { copilotTexts } from "../texts/copilotTexts";

/** Nur die Teile der Web-Speech-API, die hier gebraucht werden (TypeScript kennt sie nicht). */
interface SpeechResultList {
  length: number;
  [index: number]: { isFinal: boolean; [alt: number]: { transcript: string } };
}
interface Recognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: { resultIndex: number; results: SpeechResultList }) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  start: () => void;
  stop: () => void;
}
type RecognitionClass = new () => Recognition;

function recognitionClass(): RecognitionClass | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionClass; webkitSpeechRecognition?: RecognitionClass };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/**
 * Diktieren wie in v1: Deutsch, Zwischenergebnisse erscheinen live im Feld. Auf iOS fragt
 * getUserMedia vorher einmal das Mikrofon-Recht ab, sonst startet die Erkennung stumm nicht.
 */
export function useSpeechInput(onText: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const ref = useRef<Recognition | null>(null);
  const onTextRef = useRef(onText);
  useEffect(() => {
    onTextRef.current = onText;
  }, [onText]);
  useEffect(() => () => ref.current?.stop(), []);

  const start = useCallback(async () => {
    const Klass = recognitionClass();
    if (!Klass) return toast.error(copilotTexts.micUnsupported);
    try {
      const stream = await navigator.mediaDevices?.getUserMedia({ audio: true });
      stream?.getTracks().forEach((track) => track.stop());
    } catch {
      return toast.error(copilotTexts.micDenied);
    }
    const recognition = new Klass();
    recognition.lang = "de-DE";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      let text = "";
      for (let i = 0; i < event.results.length; i += 1) text += event.results[i]?.[0]?.transcript ?? "";
      onTextRef.current(text);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = (event) => {
      setListening(false);
      if (event.error === "not-allowed") toast.error(copilotTexts.micDenied);
    };
    ref.current = recognition;
    recognition.start();
    setListening(true);
  }, []);

  const toggle = useCallback(() => {
    if (listening) {
      ref.current?.stop();
      setListening(false);
    } else void start();
  }, [listening, start]);

  return { listening, toggle };
}
