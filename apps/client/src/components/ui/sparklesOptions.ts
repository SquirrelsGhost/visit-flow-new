import type { ISourceOptions } from "@tsparticles/engine";

export interface SparklesSettings {
  background?: string;
  minSize?: number;
  maxSize?: number;
  speed?: number;
  particleColor?: string;
  particleDensity?: number;
}

/**
 * Partikel-Einstellungen aus v1 (shared/components/ui/sparkles.tsx).
 * v1 hat alle Standardwerte ausgeschrieben, hier stehen nur die Werte, die davon abweichen.
 */
export function sparklesOptions(settings: SparklesSettings): ISourceOptions {
  return {
    background: { color: { value: settings.background || "#0d47a1" } },
    fullScreen: { enable: false, zIndex: 1 },
    fpsLimit: 120,
    interactivity: {
      events: { onClick: { enable: true, mode: "push" }, onHover: { enable: false, mode: "repulse" } },
      modes: { push: { quantity: 4 }, repulse: { distance: 200, duration: 0.4 } },
    },
    particles: {
      color: { value: settings.particleColor || "#ffffff" },
      move: {
        enable: true,
        direction: "none",
        outModes: { default: "out" },
        speed: { min: 0.1, max: 1 },
      },
      number: {
        density: { enable: true, width: 400, height: 400 },
        value: settings.particleDensity || 120,
      },
      opacity: {
        value: { min: 0.1, max: 1 },
        animation: { enable: true, speed: settings.speed || 4, sync: false, startValue: "random" },
      },
      shape: { type: "circle" },
      size: { value: { min: settings.minSize || 1, max: settings.maxSize || 3 } },
    },
    detectRetina: true,
  };
}
