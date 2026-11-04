import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { LOGO_LAYER } from "./compassLogo";

/**
 * Desktop-Bildweg mit Leuchten (Bloom) und echter Kantenglättung:
 * 1. Szene ohne Logo in halber Auflösung → daraus nur das Leuchten (Logo bekommt kein Überstrahlen, es hat sein eigenes).
 * 2. Szene mit Logo in voller Auflösung mit 4-fach Multisampling → glatte Kanten.
 * 3. Beides addieren, dann Tonwerte und Farbraum fürs Display.
 * Kein Schritt malt in einen bereits aufgelösten Multisample-Speicher zurück (das wäre auf manchen Grafikkarten undefiniert).
 */
export interface GlowPipeline {
  render: () => void;
  setSize: (width: number, height: number, ratio: number) => void;
  dispose: () => void;
}

const MSAA_SAMPLES = 4;
const BLOOM = { strength: 0.8, radius: 0.55, threshold: 0.28 } as const;

const AddBloomShader = {
  name: "AddBloomShader",
  uniforms: { tDiffuse: { value: null as THREE.Texture | null }, tBloom: { value: null as THREE.Texture | null } },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform sampler2D tBloom;
    varying vec2 vUv;
    void main() {
      vec4 base = texture2D(tDiffuse, vUv);
      gl_FragColor = vec4(base.rgb + texture2D(tBloom, vUv).rgb, base.a);
    }`,
};

export function createGlowPipeline(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera): GlowPipeline {
  const glowSource = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType });
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), BLOOM.strength, BLOOM.radius, BLOOM.threshold);

  const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: MSAA_SAMPLES }));
  composer.addPass(new RenderPass(scene, camera));
  const addBloom = new ShaderPass(AddBloomShader);
  addBloom.uniforms.tBloom.value = bloom.renderTargetsHorizontal[0].texture;
  composer.addPass(addBloom);
  composer.addPass(new OutputPass());

  return {
    render: () => {
      camera.layers.disable(LOGO_LAYER);
      renderer.setRenderTarget(glowSource);
      renderer.render(scene, camera);
      bloom.render(renderer, glowSource, glowSource, 0, false);
      camera.layers.enable(LOGO_LAYER);
      composer.render();
    },
    setSize: (width, height, ratio) => {
      composer.setPixelRatio(ratio);
      composer.setSize(width, height);
      // Das Leuchten rechnet ohnehin ab halber Auflösung; die Quelle braucht nicht mehr
      glowSource.setSize(Math.max(1, Math.round((width * ratio) / 2)), Math.max(1, Math.round((height * ratio) / 2)));
      bloom.setSize(width * ratio, height * ratio);
    },
    dispose: () => {
      bloom.dispose();
      addBloom.dispose();
      composer.dispose();
      glowSource.dispose();
    },
  };
}
