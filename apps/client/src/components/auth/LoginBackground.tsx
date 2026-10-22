import { Star } from "lucide-react";
import { BACKGROUND_STARS } from "./backgroundStars";

/** Zwei rote Lichtkreise und funkelnde Sterne hinter der Login-Karte (v1). */
export default function LoginBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/10 dark:bg-red-500/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-500/10 dark:bg-red-500/5 rounded-full blur-3xl" />
      {BACKGROUND_STARS.map(([top, left, size, delay, duration]) => (
        <Star
          key={`${top}-${left}`}
          className="absolute text-red-400/15 dark:text-red-500/10"
          style={{ top, left, width: size, height: size, animation: `twinkle ${duration}s ease-in-out ${delay}s infinite` }}
          fill="currentColor"
        />
      ))}
    </div>
  );
}
