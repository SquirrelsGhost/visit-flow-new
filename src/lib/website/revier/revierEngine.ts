import * as THREE from "three";
import { cameraAt, STILL_POSE } from "./cameraPath";
import type { DoorStatus } from "./revierData";
import { stateAt } from "./revierStates";
import { createCity } from "./scene/createCity";
import { createCompass } from "./scene/createCompass";
import { createDoors } from "./scene/createDoors";
import { createExtras } from "./scene/createExtras";
import { createStage } from "./scene/createStage";
import { createWalker } from "./scene/createWalker";

/**
 * Motor der Reise: baut die Szene, folgt weich dem Scrollfortschritt und meldet,
 * wo die schwebenden Beschriftungen auf dem Bildschirm stehen und welche Türen gerade aufleuchten.
 */
export type AnchorKey = "walker" | "coach" | "car" | "shield" | "team0" | "team1" | "team2";
export type ScreenAnchors = Partial<Record<AnchorKey, { x: number; y: number; on: boolean }>>;

export interface EngineOptions {
  lite: boolean;
  reduce: boolean;
  onFrame: (anchors: ScreenAnchors) => void;
  onDoors: (fresh: DoorStatus[]) => void;
  /** Optional: Leistungswerte etwa zweimal pro Sekunde (Anzeige mit ?perf in der Adresse). */
  onStats?: (stats: QualityStats) => void;
}

export interface RevierEngine {
  setProgress: (t: number) => void;
  /** Hält die Szene an, solange sie nicht zu sehen ist (spart Akku). */
  setActive: (on: boolean) => void;
  dispose: () => void;
}

/** Unter diesem Abstand zwischen zwei Browser-Frames (~90 Hz) gilt der Bildschirm als schnell. */
const HIGH_REFRESH_MS = 11;
/** So lange laufen Tür-Aufleuchten und Lichtstrahl nach (siehe createDoors). */
const DOOR_ANIM_MS = 700;
const FOLLOW = 0.085;

/**
 * Adaptive Qualität: misst die Bildzeit und senkt Pixeldichte und Multisampling stufenweise, sobald das Gerät
 * spürbar unter 60 Bildern pro Sekunde bleibt. Es geht nur abwärts: eine Stufe, die einmal zu langsam war, kommt nicht
 * wieder. Sonst pendelt die Qualität hin und her, und jeder Wechsel legt Speicher neu an (selbst ein kurzes Stocken).
 */
// Nie unter die echte Bildschirmauflösung (siehe MIN_PIXEL_RATIO in createStage) und nie ohne Kantenglättung:
// sonst wirkt das stehende Bild nach dem Scrollen verpixelt
const QUALITY_STEPS = [
  { scale: 1, samples: 4 },
  { scale: 0.85, samples: 4 },
  { scale: 0.85, samples: 2 },
] as const;
/** ~54 fps: darunter wirkt es auf einem 60-Hz-Bildschirm nicht mehr flüssig. */
const SLOW_MS = 18.5;
const WINDOW = 30;

export interface QualityStats {
  fps: number;
  level: number;
  pixelRatio: number;
  samples: number;
}

function createQualityGovernor(apply: (step: (typeof QUALITY_STEPS)[number]) => void, report?: (fps: number, level: number) => void) {
  let level = 0;
  let sum = 0;
  let count = 0;
  let skipWindows = 1;
  return {
    sample: (dt: number) => {
      // Lange Pausen (Tab im Hintergrund, Ruckler beim Laden) nicht mitzählen
      if (dt > 250) return;
      sum += dt;
      count += 1;
      if (count < WINDOW) return;
      const avg = sum / count;
      sum = 0;
      count = 0;
      report?.(1000 / avg, level);
      // Nach jedem Wechsel ein Fenster abwarten: das erste Bild nach dem Neuanlegen ist immer langsam
      if (skipWindows > 0) {
        skipWindows -= 1;
        return;
      }
      if (avg > SLOW_MS && level < QUALITY_STEPS.length - 1) {
        level += 1;
        skipWindows = 1;
        apply(QUALITY_STEPS[level] ?? QUALITY_STEPS[0]);
      }
    },
    reset: () => {
      sum = 0;
      count = 0;
      skipWindows = 1;
    },
  };
}

function smoothstep(a: number, b: number, x: number): number {
  const k = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return k * k * (3 - 2 * k);
}

export function createRevierEngine(canvas: HTMLCanvasElement, opts: EngineOptions): RevierEngine {
  const stage = createStage(canvas, opts.lite);
  const city = createCity();
  const doors = createDoors();
  const compass = createCompass();
  const walker = createWalker();
  const extras = createExtras();
  stage.scene.add(city.group, doors.group, compass.group, walker.group, extras.group);

  let target = 0;
  let shown = 0;
  let frame = 0;
  let running = true;
  let last = 0;
  let dirty = true;
  let lastTick = 0;
  let refresh = 1000 / 60;
  let tick = 0;
  let busyUntil = 0;
  const quality = createQualityGovernor(
    (step) => stage.setQuality(step.scale, step.samples),
    opts.onStats &&
      ((fps, level) => opts.onStats?.({ fps, level, pixelRatio: stage.pixelRatio(), samples: QUALITY_STEPS[level]?.samples ?? 4 })),
  );
  const v = new THREE.Vector3();
  const look = new THREE.Vector3();
  const dir = new THREE.Vector3();

  // Größe kommt aus dem Cache der Bühne: canvas.clientWidth je Frame würde nach den Stil-Schreibvorgängen ein Layout erzwingen
  const toScreen = (p: THREE.Vector3, on: boolean) => {
    v.copy(p).project(stage.camera);
    return { x: (v.x * 0.5 + 0.5) * stage.size.width, y: (-v.y * 0.5 + 0.5) * stage.size.height, on: on && v.z < 1 };
  };

  const loop = (now: number) => {
    if (!running) return;
    frame = requestAnimationFrame(loop);
    // Auf 120/144-Hz-Bildschirmen nur jedes zweite Bild zeichnen (60/72 fps): halbe Arbeit, gleichmäßiger Takt
    const raw = now - lastTick;
    lastTick = now;
    if (raw > 0 && raw < 50) refresh += (raw - refresh) * 0.1;
    if (refresh < HIGH_REFRESH_MS && (tick++ & 1) === 1) return;
    const dt = now - last;
    // Bewegung reduziert: keine Eigenanimation, also nur neu zeichnen, wenn sich etwas ändert
    if (opts.reduce && !dirty && now > busyUntil) return;
    dirty = false;
    if (last && !opts.reduce) quality.sample(dt);
    last = now;
    // Glättung unabhängig von der Bildrate (0.085 je 60-Hz-Frame wie bisher)
    const follow = 1 - Math.pow(1 - FOLLOW, Math.min(dt, 100) / (1000 / 60));
    shown = opts.reduce ? target : Math.abs(target - shown) < 1e-5 ? target : shown + (target - shown) * follow;
    const s = stateAt(shown);
    const pose = opts.reduce ? STILL_POSE : cameraAt(shown);
    stage.camera.position.set(...pose.pos);
    look.set(...pose.look);
    // Fast senkrechter Blick nach unten: "oben" im Bild über Norden (-z) festlegen statt über die Welt-Hochachse.
    // Sonst bestimmt der winzige waagerechte Versatz die Drehung des Bildes, und das Logo dreht sich kurz vor dem Ziel weg und zurück
    dir.subVectors(look, stage.camera.position).normalize();
    const steep = smoothstep(0.8, 0.97, -dir.y);
    stage.camera.up.set(0, 1 - steep, -steep).normalize();
    stage.camera.lookAt(look);

    city.rise(opts.reduce ? Math.max(s.rise, 1 - s.compass) : s.rise);
    compass.set(opts.reduce ? 0 : s.compass, s.spread, s.spin);
    const fresh = doors.apply(s.doors, now);
    if (fresh.length) busyUntil = now + DOOR_ANIM_MS;
    if (fresh.length && fresh.length < 4) opts.onDoors(fresh);
    doors.tick(now);
    walker.set(s.walker, s.visited, s.showWalker, s.coach, s.team, now);
    extras.set(s.drive, s.shield, now);
    stage.render();

    opts.onFrame({
      walker: toScreen(walker.anchors.walker, s.saleLabel),
      coach: toScreen(walker.anchors.coach, s.coach > 0.5 && !s.teamLabel),
      // Nur auf der Fahrt: nicht mehr im Finale, wenn der Kompass zurückkommt
      car: toScreen(extras.anchors.car, s.drive > 0.15 && s.shield < 0.1 && s.compass < 0.01),
      shield: toScreen(extras.anchors.shield, s.shield > 0.6),
      team0: toScreen(walker.anchors.team[0] ?? v, s.teamLabel),
      team1: toScreen(walker.anchors.team[1] ?? v, s.teamLabel),
      team2: toScreen(walker.anchors.team[2] ?? v, s.teamLabel),
    });
  };

  // Größe der Leinwand beobachten statt nur des Fensters; "resize" fängt Zoom und Pixeldichte ab
  const onResize = () => {
    stage.resize();
    dirty = true;
  };
  const sizeWatch = new ResizeObserver(onResize);
  sizeWatch.observe(canvas);
  window.addEventListener("resize", onResize);
  stage.resize();
  // Shader vorab übersetzen, statt beim ersten Auftauchen von Kuppel, Auto oder Läufer mitten im Scrollen zu stocken
  stage.renderer.compile(stage.scene, stage.camera);
  frame = requestAnimationFrame(loop);

  return {
    setProgress: (t) => {
      target = Math.min(Math.max(t, 0), 1);
      dirty = true;
    },
    setActive: (on) => {
      if (on === running) return;
      running = on;
      cancelAnimationFrame(frame);
      last = 0;
      dirty = true;
      quality.reset();
      if (on) frame = requestAnimationFrame(loop);
    },
    dispose: () => {
      running = false;
      cancelAnimationFrame(frame);
      sizeWatch.disconnect();
      window.removeEventListener("resize", onResize);
      [city, doors, compass, walker, extras].forEach((part) => part.dispose());
      stage.dispose();
    },
  };
}
