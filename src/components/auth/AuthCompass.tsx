import type { CSSProperties } from "react";
import { useQiblaCompass } from "../../hooks/useQiblaCompass";
import { cn } from "../../lib/cn";
import { compassTexts } from "../../texts/loginTexts";
import CompassGraphic from "./CompassGraphic";

const SPIN: CSSProperties = { animation: "authSpin 20s linear infinite" };

/**
 * Sich drehender Kompass über dem Titel. Im Qibla-Modus steht er still und zeigt die Richtung.
 * Die Drehung läuft ohne CSS-Transition, sonst springt sie bei Hover zurück (Hinweis aus v1).
 */
export interface AuthCompassProps { readonly _?: never; }

export default function AuthCompass() {
  const { qiblaMode, isCalculating, needleRotation, onCompassClick } = useQiblaCompass();
  const style: CSSProperties =
    needleRotation === null
      ? SPIN
      : {
          transform: `rotate(${needleRotation}deg)`,
          transition: "transform 300ms ease-out",
        };

  return (
    <div className="relative z-10 flex justify-center mb-6 max-[700px]:mb-2 mt-2 max-[700px]:mt-0">
      <div
        className="relative w-24 h-24 max-[700px]:w-16 max-[700px]:h-16 flex items-center justify-center cursor-pointer group transition-transform duration-500 hover:scale-110"
        onClick={onCompassClick}
        title={compassTexts.hint}
        data-testid="auth-compass"
      >
        <div
          className={cn(
            "absolute -inset-3 bg-gradient-to-br rounded-full blur-2xl transition-all duration-500",
            qiblaMode
              ? "from-green-500/25 to-green-700/25 dark:from-green-500/15 dark:to-green-700/15"
              : "from-red-500/20 to-red-700/20 dark:from-red-500/10 dark:to-red-700/10",
            isCalculating ? "animate-pulse" : "group-hover:scale-125",
          )}
        />
        <div className="relative z-10" style={style}>
          <CompassGraphic qiblaMode={qiblaMode} dimmed={isCalculating} />
        </div>
      </div>
    </div>
  );
}
