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
}

export interface RevierEngine {
  setProgress: (t: number) => void;
  /** Hält die Szene an, solange sie nicht zu sehen ist (spart Akku). */
  setActive: (on: boolean) => void;
  dispose: () => void;
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
  const v = new THREE.Vector3();
  const look = new THREE.Vector3();

  const toScreen = (p: THREE.Vector3, on: boolean) => {
    v.copy(p).project(stage.camera);
    return { x: (v.x * 0.5 + 0.5) * canvas.clientWidth, y: (-v.y * 0.5 + 0.5) * canvas.clientHeight, on: on && v.z < 1 };
  };

  const loop = (now: number) => {
    if (!running) return;
    shown = opts.reduce ? target : shown + (target - shown) * 0.085;
    const s = stateAt(shown);
    const pose = opts.reduce ? STILL_POSE : cameraAt(shown);
    stage.camera.position.set(...pose.pos);
    stage.camera.lookAt(look.set(...pose.look));

    city.rise(opts.reduce ? Math.max(s.rise, 1 - s.compass) : s.rise);
    compass.set(opts.reduce ? 0 : s.compass, s.spread, s.spin);
    const fresh = doors.apply(s.doors, now);
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
    frame = requestAnimationFrame(loop);
  };

  // Größe der Leinwand beobachten statt nur des Fensters; "resize" fängt Zoom und Pixeldichte ab
  const onResize = () => stage.resize();
  const sizeWatch = new ResizeObserver(onResize);
  sizeWatch.observe(canvas);
  window.addEventListener("resize", onResize);
  stage.resize();
  frame = requestAnimationFrame(loop);

  return {
    setProgress: (t) => {
      target = Math.min(Math.max(t, 0), 1);
    },
    setActive: (on) => {
      if (on === running) return;
      running = on;
      cancelAnimationFrame(frame);
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
