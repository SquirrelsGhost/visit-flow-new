import { Star } from "lucide-react";
import { BACKGROUND_STARS } from "./backgroundStars";

/** Langsam treibende Lichtkreise und funkelnde Sterne hinter der Login-Karte (aus v1, jetzt in Bewegung). */
export interface LoginBackgroundProps { readonly _?: never; }

export default function LoginBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/10 dark:bg-red-500/5 rounded-full blur-3xl animate-aurora" />
      <div
        className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-500/10 dark:bg-red-500/5 rounded-full blur-3xl animate-aurora"
        style={{ animationDelay: "-6s" }}
      />
      <div
        className="absolute top-1/3 left-1/2 w-[28rem] h-[28rem] -translate-x-1/2 bg-orange-400/[0.06] dark:bg-red-700/[0.06] rounded-full blur-3xl animate-aurora"
        style={{ animationDelay: "-12s", animationDuration: "26s" }}
      />
      {BACKGROUND_STARS.map(([top, left, size, delay, duration]) => (
        <Star
          key={`${top}-${left}`}
          className="absolute text-red-400/15 dark:text-red-500/10"
          style={{
            top,
            left,
            width: size,
            height: size,
            animation: `twinkle ${duration}s ease-in-out ${delay}s infinite`,
          }}
          fill="currentColor"
        />
      ))}
    </div>
  );
}
