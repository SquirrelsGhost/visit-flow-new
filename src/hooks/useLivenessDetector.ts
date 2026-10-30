import { useEffect, useRef, useState, type RefObject } from "react";
import { faceHint, measureFace, type FaceHint } from "@/lib/ident/faceMetrics";
import { initialLiveness, LIVENESS_MOVES, stepLiveness, type LivenessState } from "@/lib/ident/livenessMachine";
import { loadFaceLandmarker } from "@/lib/ident/visionModels";
import { speak } from "@/lib/ident/voiceGuide";
import { feedback } from "@/lib/feedback/feedback";
import { identWizardTexts } from "@/texts/identWizardTexts";

const FRAME_MS = 66;
const HINT_SAY_AFTER_MS = 1800;

export interface LivenessView {
  status: "idle" | "loading" | "ready" | "unavailable";
  state: LivenessState;
  hint: FaceHint | null;
  audio: number;
  /** Zeitpunkt der letzten erkannten Bewegung (für das kurze „Erkannt“). */
  detectedAt: number;
}

function audioMeter(stream: MediaStream) {
  if (!stream.getAudioTracks().length || typeof AudioContext === "undefined") return null;
  const ctx = new AudioContext();
  void ctx.resume().catch(() => undefined);
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 1024;
  ctx.createMediaStreamSource(stream).connect(analyser);
  const buf = new Float32Array(analyser.fftSize);
  return {
    /** null, solange der Browser den Ton noch nicht freigibt: dann zählt nur die Mundbewegung. */
    level: () => {
      if (ctx.state !== "running") return null;
      analyser.getFloatTimeDomainData(buf);
      let sum = 0;
      for (const v of buf) sum += v * v;
      return Math.min(1, Math.sqrt(sum / buf.length) * 4);
    },
    close: () => void ctx.close().catch(() => undefined),
  };
}

function frameLuma(ctx: CanvasRenderingContext2D, video: HTMLVideoElement) {
  ctx.drawImage(video, 0, 0, 32, 24);
  const data = ctx.getImageData(0, 0, 32, 24).data;
  let sum = 0;
  for (let i = 0; i < data.length; i += 4) sum += (data[i] * 77 + data[i + 1] * 150 + data[i + 2] * 29) >> 8;
  return sum / (data.length / 4);
}

/**
 * Erkennt live im Kamerabild: Ausrichtung im Oval, Kopf links, rechts, oben und das Vorlesen (Mund + Mikrofon).
 * Sagt jeden nächsten Schritt an und meldet das Ende über onDone. Ohne Erkennung bleibt status "unavailable".
 */
export function useLivenessDetector(videoRef: RefObject<HTMLVideoElement | null>, stream: MediaStream | null, onDone: () => void): LivenessView {
  const [view, setView] = useState<LivenessView>({ status: "idle", state: initialLiveness(), hint: null, audio: 0, detectedAt: 0 });
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  });

  useEffect(() => {
    if (!stream) return;
    let cancelled = false;
    let timer = 0;
    let state = initialLiveness();
    let hintSince = 0;
    let lastHint: FaceHint | null = null;
    let detectedAt = 0;
    const meter = audioMeter(stream);
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 24;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    void loadFaceLandmarker().then((landmarker) => {
      if (cancelled) return;
      if (!landmarker || !ctx) {
        setView((v) => ({ ...v, status: "unavailable" }));
        return;
      }
      setView({ status: "ready", state, hint: null, audio: 0, detectedAt: 0 });
      speak(identWizardTexts.liveness.say.start);
      const tick = () => {
        if (cancelled) return;
        timer = window.setTimeout(tick, FRAME_MS);
        const video = videoRef.current;
        if (!video?.videoWidth || video.readyState < 2) return;
        const now = performance.now();
        const result = landmarker.detectForVideo(video, now);
        const faces = result.faceLandmarks.map((points, i) => measureFace(points, result.faceBlendshapes?.[i]?.categories ?? []));
        const hint = faceHint(faces, frameLuma(ctx, video));
        const audio = meter ? meter.level() : null;
        const { state: next, event } = stepLiveness(state, { ts: now, face: faces.length === 1 ? faces[0] : null, hint, audio });
        state = next;
        if (event === "aligned" || event === "moveDone") {
          if (event === "moveDone") {
            feedback("success");
            detectedAt = now;
          }
          speak(identWizardTexts.liveness.say[LIVENESS_MOVES[state.moveIdx]]);
        }
        const relevantHint = state.phase === "align" || hint === "noFace" || hint === "multiple" ? hint : null;
        if (relevantHint !== lastHint) {
          lastHint = relevantHint;
          hintSince = now;
        } else if (relevantHint && now - hintSince > HINT_SAY_AFTER_MS) {
          speak(identWizardTexts.liveness.hints[relevantHint], { interrupt: false });
          hintSince = now;
        }
        setView({ status: "ready", state, hint: relevantHint, audio: audio ?? 0, detectedAt });
        if (event === "done") {
          cancelled = true;
          window.clearTimeout(timer);
          feedback("success");
          speak(identWizardTexts.liveness.say.done);
          onDoneRef.current();
        }
      };
      tick();
    });

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      meter?.close();
    };
  }, [stream, videoRef]);

  // Bis das Modell geladen ist, gilt „lädt“; ohne Kamera ruht die Erkennung.
  if (!stream) return { ...view, status: "idle" };
  return view.status === "idle" ? { ...view, status: "loading" } : view;
}
