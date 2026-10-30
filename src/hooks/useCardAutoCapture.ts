import { useEffect, useRef, useState, type RefObject } from "react";
import { cardHint, cardStats, frameMotion, toGray, type CardHint } from "@/lib/ident/cardMetrics";
import { loadFaceDetector } from "@/lib/ident/visionModels";
import { speak } from "@/lib/ident/voiceGuide";
import { identWizardTexts } from "@/texts/identWizardTexts";
import { frameCrop } from "./useIdScanCamera";

const SAMPLE_W = 320;
const SAMPLE_H = 202;
const INTERVAL_MS = 120;
const READY_HOLD_MS = 800;
const HINT_SAY_AFTER_MS = 2200;

export interface CardAutoState {
  status: "loading" | "ready";
  hint: CardHint | null;
  /** 0..1 bis zur automatischen Aufnahme. */
  progress: number;
}

interface Options {
  videoRef: RefObject<HTMLVideoElement | null>;
  stageRef: RefObject<HTMLDivElement | null>;
  frameRef: RefObject<HTMLDivElement | null>;
  side: "front" | "back" | null;
  enabled: boolean;
  onReady: () => void;
}

/**
 * Prüft das Kamerabild im Rahmen laufend: Licht, Spiegelung, Lichtbild auf der richtigen Seite, Schärfe, Ruhe.
 * Passt alles einen Moment lang, löst die Aufnahme von selbst aus. Wird es lange nichts, sinkt die Strenge.
 */
export function useCardAutoCapture({ videoRef, stageRef, frameRef, side, enabled, onReady }: Options): CardAutoState {
  const [state, setState] = useState<CardAutoState>({ status: "loading", hint: null, progress: 0 });
  const onReadyRef = useRef(onReady);
  useEffect(() => {
    onReadyRef.current = onReady;
  });

  useEffect(() => {
    if (!enabled || !side) return;
    let cancelled = false;
    let timer = 0;
    let prev: Uint8Array | null = null;
    let readySince: number | null = null;
    let hintSince = 0;
    let lastHint: CardHint | null = null;
    const startedAt = performance.now();
    const canvas = document.createElement("canvas");
    canvas.width = SAMPLE_W;
    canvas.height = SAMPLE_H;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    speak(identWizardTexts.cardAuto.say[side]);

    const run = async () => {
      const detector = await loadFaceDetector();
      if (cancelled) return;
      setState((s) => ({ ...s, status: "ready" }));
      const tick = () => {
        if (cancelled) return;
        timer = window.setTimeout(tick, INTERVAL_MS);
        const video = videoRef.current;
        const stage = stageRef.current?.getBoundingClientRect();
        const frame = frameRef.current?.getBoundingClientRect();
        if (!ctx || !video?.videoWidth || !stage?.height || !frame?.width) return;
        const crop = frameCrop(video.videoWidth, video.videoHeight, stage.width / stage.height, frame.width / stage.width);
        ctx.drawImage(video, crop.x, crop.y, crop.w, crop.h, 0, 0, SAMPLE_W, SAMPLE_H);
        const gray = toGray(ctx.getImageData(0, 0, SAMPLE_W, SAMPLE_H).data);
        const now = performance.now();
        const box = detector?.detectForVideo(canvas, now).detections[0]?.boundingBox;
        const portrait = box ? { cx: (box.originX + box.width / 2) / SAMPLE_W, cy: (box.originY + box.height / 2) / SAMPLE_H, height: box.height / SAMPLE_H } : detector ? null : { cx: 0.25, cy: 0.5, height: 0.5 };
        const elapsed = now - startedAt;
        const strictness = elapsed > 15000 ? 0.55 : elapsed > 8000 ? 0.75 : 1;
        const hint = cardHint({ side, stats: cardStats(gray, SAMPLE_W, SAMPLE_H), motion: frameMotion(prev, gray), portrait, strictness });
        prev = gray;
        if (hint !== lastHint) {
          lastHint = hint;
          hintSince = now;
        } else if (hint && hint !== "holdStill" && now - hintSince > HINT_SAY_AFTER_MS) {
          speak(identWizardTexts.cardAuto.hints[hint], { interrupt: false });
          hintSince = now;
        }
        readySince = hint ? null : (readySince ?? now);
        const progress = readySince === null ? 0 : Math.min(1, (now - readySince) / READY_HOLD_MS);
        setState({ status: "ready", hint, progress });
        if (progress >= 1) {
          cancelled = true;
          window.clearTimeout(timer);
          onReadyRef.current();
        }
      };
      tick();
    };
    void run();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [enabled, side, videoRef, stageRef, frameRef]);

  return state;
}
