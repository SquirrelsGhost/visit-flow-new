import type { FaceFrame, FaceHint } from "./faceMetrics";

/** Reihenfolge wie im Sicherheitsvertrag: links, rechts, oben, dann Satz mit Prüf-Code. */
export const LIVENESS_MOVES = ["left", "right", "up", "speak"] as const;
export type LivenessMove = (typeof LIVENESS_MOVES)[number];

const ALIGN_HOLD_MS = 900;
const MOVE_HOLD_MS = 350;
const SPEECH_NEEDED_MS = 2600;
const YAW_DELTA = 0.11;
const PITCH_DELTA = 0.045;
const SPEECH_LEVEL = 0.035;

export interface LivenessEvidence {
  move: LivenessMove;
  at: number;
  value: number;
}

export interface LivenessState {
  phase: "align" | "move" | "done";
  moveIdx: number;
  neutral: { yaw: number; pitch: number } | null;
  holdSince: number | null;
  /** Anteil 0..1 der aktuellen Haltezeit bzw. Sprechzeit (für den Fortschrittsring). */
  progress: number;
  speechMs: number;
  lastTs: number | null;
  lastJaw: number;
  blinks: number;
  eyesClosed: boolean;
  evidence: LivenessEvidence[];
}

export interface LivenessInput {
  ts: number;
  face: FaceFrame | null;
  hint: FaceHint | null;
  /** Lautstärke 0..1 vom Mikrofon, null ohne Mikrofon (dann zählt nur die Mundbewegung). */
  audio: number | null;
}

export type LivenessEvent = "aligned" | "moveDone" | "done" | null;

export const initialLiveness = (): LivenessState => ({ phase: "align", moveIdx: 0, neutral: null, holdSince: null, progress: 0, speechMs: 0, lastTs: null, lastJaw: 0, blinks: 0, eyesClosed: false, evidence: [] });

function poseValue(move: LivenessMove, face: FaceFrame, neutral: { yaw: number; pitch: number }): number {
  if (move === "left") return (face.yaw - neutral.yaw) / YAW_DELTA;
  if (move === "right") return (neutral.yaw - face.yaw) / YAW_DELTA;
  return (neutral.pitch - face.pitch) / PITCH_DELTA;
}

/** Ein Bild weiter: prüft Ausrichtung, Haltezeit der Bewegung und Sprechdauer. Rein, damit es testbar bleibt. */
export function stepLiveness(s: LivenessState, input: LivenessInput): { state: LivenessState; event: LivenessEvent } {
  if (s.phase === "done") return { state: s, event: null };
  const dt = s.lastTs === null ? 0 : Math.min(200, Math.max(0, input.ts - s.lastTs));
  const face = input.face;
  const next: LivenessState = { ...s, lastTs: input.ts, lastJaw: face?.jaw ?? s.lastJaw };
  if (face) {
    if (!s.eyesClosed && face.blink > 0.5) next.eyesClosed = true;
    else if (s.eyesClosed && face.blink < 0.3) Object.assign(next, { eyesClosed: false, blinks: s.blinks + 1 });
  }

  if (s.phase === "align") {
    if (!face || input.hint) return { state: { ...next, holdSince: null, progress: 0 }, event: null };
    const since = s.holdSince ?? input.ts;
    const held = input.ts - since;
    if (held < ALIGN_HOLD_MS) return { state: { ...next, holdSince: since, progress: held / ALIGN_HOLD_MS }, event: null };
    return { state: { ...next, phase: "move", neutral: { yaw: face.yaw, pitch: face.pitch }, holdSince: null, progress: 0 }, event: "aligned" };
  }

  const move = LIVENESS_MOVES[s.moveIdx];
  if (!face || input.hint === "noFace" || input.hint === "multiple" || !s.neutral) return { state: { ...next, holdSince: null, progress: move === "speak" ? s.progress : 0 }, event: null };

  if (move === "speak") {
    const mouthMoving = face.jaw > 0.12 || Math.abs(face.jaw - s.lastJaw) > 0.03;
    const speaking = input.audio === null ? mouthMoving : input.audio > SPEECH_LEVEL && mouthMoving;
    const speechMs = s.speechMs + (speaking ? dt : 0);
    if (speechMs < SPEECH_NEEDED_MS) return { state: { ...next, speechMs, progress: speechMs / SPEECH_NEEDED_MS }, event: null };
    return { state: { ...next, speechMs, progress: 1, phase: "done", evidence: [...s.evidence, { move, at: input.ts, value: Math.round(speechMs) }] }, event: "done" };
  }

  const value = poseValue(move, face, s.neutral);
  if (value < 1) return { state: { ...next, holdSince: null, progress: Math.max(0, Math.min(0.6, value * 0.6)) }, event: null };
  const since = s.holdSince ?? input.ts;
  const held = input.ts - since;
  if (held < MOVE_HOLD_MS) return { state: { ...next, holdSince: since, progress: 0.6 + (0.4 * held) / MOVE_HOLD_MS }, event: null };
  const evidence = [...s.evidence, { move, at: input.ts, value: Math.round(value * 100) / 100 }];
  return { state: { ...next, moveIdx: s.moveIdx + 1, holdSince: null, progress: 0, evidence }, event: "moveDone" };
}
