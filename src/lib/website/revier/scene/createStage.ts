import * as THREE from "three";
import { LOGO_LAYER } from "./compassLogo";
import { createGlowPipeline } from "./createGlowPipeline";

/**
 * Bühne: Renderer, Nachthimmel mit Nebel, Kamera und Licht.
 * Desktop mit Leuchten und Multisampling (createGlowPipeline), Handy direkt mit der Kantenglättung des Browsers.
 * Pixeldichte begrenzt (Desktop 1.5, weil das Multisampling dort ohnehin glättet; Handy 2) und
 * per `setQuality` weiter absenkbar, wenn das Gerät nicht mitkommt.
 */
export interface Stage {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  render: () => void;
  /** Passt Auflösung an Größe und Pixeldichte an (auch nach Zoomen oder Wechsel auf einen anderen Bildschirm). */
  resize: () => void;
  /** Faktor auf die Pixeldichte (1 = volle Qualität) und Multisampling. Die adaptive Qualität im Motor senkt beides bei Ruckeln. */
  setQuality: (scale: number, samples: number) => void;
  /** Aktuelle Größe der Leinwand in CSS-Pixeln, ohne Layout abzufragen. */
  size: { width: number; height: number };
  /** Aktuelle effektive Pixeldichte (für die Leistungsanzeige). */
  pixelRatio: () => number;
  dispose: () => void;
}

const NIGHT = "#05060b";
/** Mit Leuchten (Desktop) rendert die Szene in ein 4x-Multisampling-Ziel: mehr als 1.5 bringt dort kaum Schärfe, kostet aber viel. */
const MAX_PIXEL_RATIO_GLOW = 1.5;
const MAX_PIXEL_RATIO_LITE = 2;
const MIN_PIXEL_RATIO = 0.75;

export function createStage(canvas: HTMLCanvasElement, lite: boolean): Stage {
  // Mit Leuchten malt der Bildweg selbst glatt (Multisampling-Ziel); ein zweiter Multisampling-Puffer der Leinwand wäre verschwendet
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: lite, stencil: false, powerPreference: "high-performance", alpha: false });
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
  const maxRatio = lite ? MAX_PIXEL_RATIO_LITE : MAX_PIXEL_RATIO_GLOW;
  let quality = 1;
  const size = { width: 0, height: 0 };
  const pixelRatio = () => Math.max(MIN_PIXEL_RATIO, Math.min(window.devicePixelRatio || 1, maxRatio) * quality);

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = canvas;
    if (!w || !h) return;
    size.width = w;
    size.height = h;
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
    size,
    render: () => (glow ? glow.render() : renderer.render(scene, camera)),
    resize,
    pixelRatio,
    setQuality: (scale, samples) => {
      glow?.setSamples(samples);
      if (scale === quality) return;
      quality = scale;
      resize();
    },
    dispose: () => {
      glow?.dispose();
      renderer.dispose();
    },
  };
}
