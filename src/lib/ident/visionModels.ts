import type { FaceDetector, FaceLandmarker } from "@mediapipe/tasks-vision";

/**
 * Gesichtserkennung läuft komplett im Browser (MediaPipe, WebAssembly). Laufzeit und Modelle liegen unter
 * public/mediapipe, damit kein Kamerabild und keine Anfrage an fremde Server geht (DSGVO, Art. 9).
 */
const WASM_PATH = "/mediapipe/wasm";
const LANDMARKER_MODEL = "/mediapipe/models/face_landmarker.task";
const DETECTOR_MODEL = "/mediapipe/models/blaze_face_short_range.tflite";

let landmarker: Promise<FaceLandmarker | null> | null = null;
let detector: Promise<FaceDetector | null> | null = null;

async function fileset() {
  const { FilesetResolver } = await import("@mediapipe/tasks-vision");
  return FilesetResolver.forVisionTasks(WASM_PATH);
}

/** GPU zuerst, sonst CPU; liefert null, wenn das Gerät die Erkennung nicht kann (dann gilt der manuelle Ablauf). */
async function withDelegate<T>(create: (delegate: "GPU" | "CPU") => Promise<T>): Promise<T | null> {
  try {
    return await create("GPU");
  } catch {
    try {
      return await create("CPU");
    } catch {
      return null;
    }
  }
}

/** Gesichtsnetz mit Mimik-Werten (Blinzeln, Mund) für den Live-Video-Ident. */
export function loadFaceLandmarker(): Promise<FaceLandmarker | null> {
  landmarker ??= (async () => {
    const { FaceLandmarker } = await import("@mediapipe/tasks-vision");
    const files = await fileset();
    return withDelegate((delegate) =>
      FaceLandmarker.createFromOptions(files, { baseOptions: { modelAssetPath: LANDMARKER_MODEL, delegate }, runningMode: "VIDEO", numFaces: 2, outputFaceBlendshapes: true }),
    );
  })().catch(() => null);
  return landmarker;
}

/** Schneller Gesichtsfinder für das Lichtbild auf dem Ausweis. */
export function loadFaceDetector(): Promise<FaceDetector | null> {
  detector ??= (async () => {
    const { FaceDetector } = await import("@mediapipe/tasks-vision");
    const files = await fileset();
    return withDelegate((delegate) => FaceDetector.createFromOptions(files, { baseOptions: { modelAssetPath: DETECTOR_MODEL, delegate }, runningMode: "VIDEO", minDetectionConfidence: 0.5 }));
  })().catch(() => null);
  return detector;
}
