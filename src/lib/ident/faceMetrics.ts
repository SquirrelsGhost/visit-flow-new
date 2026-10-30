/** Kennzahlen eines Gesichts aus den 478 MediaPipe-Punkten (Bildkoordinaten 0..1, Kamera nicht gespiegelt). */
export interface FaceFrame {
  /** Drehung: Nasenspitze zwischen den Wangen, 0 = geradeaus; positiv = Kopf zur eigenen linken Seite gedreht. */
  yaw: number;
  /** Neigung: Nasenspitze zwischen Stirn und Kinn (kleiner = Kopf nach oben). */
  pitch: number;
  cx: number;
  cy: number;
  /** Höhe des Gesichts im Bild (0..1), Maß für den Abstand zur Kamera. */
  height: number;
  /** Augen geschlossen 0..1. */
  blink: number;
  /** Mund geöffnet 0..1. */
  jaw: number;
}

export interface LandmarkPoint {
  x: number;
  y: number;
}

export interface BlendshapeScore {
  categoryName: string;
  score: number;
}

const NOSE = 1;
const CHEEK_IMAGE_LEFT = 234;
const CHEEK_IMAGE_RIGHT = 454;
const FOREHEAD = 10;
const CHIN = 152;

export type FaceHint = "noFace" | "multiple" | "tooFar" | "tooClose" | "offCenter" | "dark";

const score = (shapes: readonly BlendshapeScore[], name: string) => shapes.find((s) => s.categoryName === name)?.score ?? 0;

export function measureFace(points: readonly LandmarkPoint[], shapes: readonly BlendshapeScore[] = []): FaceFrame {
  const nose = points[NOSE];
  const left = points[CHEEK_IMAGE_LEFT];
  const right = points[CHEEK_IMAGE_RIGHT];
  const top = points[FOREHEAD];
  const chin = points[CHIN];
  let minX = 1, maxX = 0, minY = 1, maxY = 0;
  for (const p of points) {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }
  return {
    // Im ungespiegelten Kamerabild liegt die eigene linke Seite rechts: Kopf nach links = Nase wandert nach rechts.
    yaw: (nose.x - left.x) / Math.max(1e-6, right.x - left.x) - 0.5,
    pitch: (nose.y - top.y) / Math.max(1e-6, chin.y - top.y),
    cx: (minX + maxX) / 2,
    cy: (minY + maxY) / 2,
    height: maxY - minY,
    blink: (score(shapes, "eyeBlinkLeft") + score(shapes, "eyeBlinkRight")) / 2,
    jaw: score(shapes, "jawOpen"),
  };
}

/** Was am Bild noch nicht passt, in der Reihenfolge, in der man es dem Nutzer sagen sollte. */
export function faceHint(faces: readonly FaceFrame[], luma: number): FaceHint | null {
  if (faces.length === 0) return "noFace";
  if (faces.length > 1) return "multiple";
  if (luma < 55) return "dark";
  const [f] = faces;
  if (f.height < 0.24) return "tooFar";
  if (f.height > 0.88) return "tooClose";
  if (Math.abs(f.cx - 0.5) > 0.16 || Math.abs(f.cy - 0.5) > 0.2) return "offCenter";
  return null;
}
