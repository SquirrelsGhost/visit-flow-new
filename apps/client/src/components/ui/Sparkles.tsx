import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { useEffect, useId, useMemo, useState } from "react";
import { cn } from "../../lib/cn";
import { sparklesOptions, type SparklesSettings } from "./sparklesOptions";

interface SparklesProps extends SparklesSettings {
  id?: string;
  className?: string;
}

let engineReady: Promise<void> | null = null;

/** Funkelnde Partikel aus v1 (SparklesCore). Blendet sich nach dem Laden in 1 s ein. */
export default function Sparkles({ id, className, ...settings }: SparklesProps) {
  const [init, setInit] = useState(false);
  const [visible, setVisible] = useState(false);
  const generatedId = useId();
  const { background, minSize, maxSize, speed, particleColor, particleDensity } = settings;
  const options = useMemo(
    () => sparklesOptions({ background, minSize, maxSize, speed, particleColor, particleDensity }),
    [background, minSize, maxSize, speed, particleColor, particleDensity],
  );

  useEffect(() => {
    engineReady ??= initParticlesEngine((engine) => loadSlim(engine));
    let active = true;
    void engineReady.then(() => active && setInit(true));
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className={cn("opacity-0 transition-opacity duration-1000", visible && "opacity-100", className)}>
      {init && (
        <Particles
          id={id || generatedId}
          className="h-full w-full"
          particlesLoaded={async (container) => setVisible(Boolean(container))}
          options={options}
        />
      )}
    </div>
  );
}
