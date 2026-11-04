import * as THREE from "three";
import { LOGO_LAYER } from "./compassLogo";
import { createGlowPipeline } from "./createGlowPipeline";

/**
 * Bühne: Renderer, Nachthimmel mit Nebel, Kamera und Licht.
 * Desktop mit Leuchten und Multisampling (createGlowPipeline), Handy direkt mit der Kantenglättung des Browsers.
 * Volle Pixeldichte bis 2, damit Logo und Kanten auf jedem Bildschirm scharf bleiben.
 */
export interface Stage {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  render: () => void;
  /** Passt Auflösung an Größe und Pixeldichte an (auch nach Zoomen oder Wechsel auf einen anderen Bildschirm). */
  resize: () => void;
  dispose: () => void;
}

const NIGHT = "#05060b";
const MAX_PIXEL_RATIO = 2;

const pixelRatio = () => Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);

export function createStage(canvas: HTMLCanvasElement, lite: boolean): Stage {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance", alpha: false });
  renderer.setPixelRatio(pixelRatio());
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(NIGHT);
  scene.fog = new THREE.FogExp2(NIGHT, 0.0065);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.5, 700);
  camera.layers.enable(LOGO_LAYER);

  scene.add(new THREE.HemisphereLight("#6d6aff", "#120507", 0.55));
  const moon = new THREE.DirectionalLight("#cbd5ff", 0.9);
  moon.position.set(-40, 80, 30);
  scene.add(moon);
  const ember = new THREE.PointLight("#ef4444", 70, 120, 1.8);
  ember.position.set(0, 26, 0);
  scene.add(ember);

  const glow = lite ? null : createGlowPipeline(renderer, scene, camera);

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = canvas;
    if (!w || !h) return;
    const ratio = pixelRatio();
    renderer.setPixelRatio(ratio);
    renderer.setSize(w, h, false);
    glow?.setSize(w, h, ratio);
    camera.aspect = w / h;
    // Auf schmalen Bildschirmen weiter zurück, damit das Viertel hineinpasst
    camera.fov = w < h ? 58 : 42;
    camera.updateProjectionMatrix();
  };

  return {
    renderer,
    scene,
    camera,
    render: () => (glow ? glow.render() : renderer.render(scene, camera)),
    resize,
    dispose: () => {
      glow?.dispose();
      renderer.dispose();
    },
  };
}
