import { useEffect, useState, type RefObject } from "react";

/**
 * true, sobald das Element einmal sichtbar war. Ohne IntersectionObserver (ältere Browser, Tests)
 * gilt es sofort als gesehen, damit Zahlen nie auf dem Startwert stehen bleiben.
 */
export function useSeenOnce(ref: RefObject<Element | null>): boolean {
  // Ohne Beobachter (Tests, alte Browser) gilt das Element von Anfang an als gesehen
  const [seen, setSeen] = useState(() => typeof IntersectionObserver === "undefined");
  useEffect(() => {
    const el = ref.current;
    if (seen || !el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, seen]);
  return seen;
}
