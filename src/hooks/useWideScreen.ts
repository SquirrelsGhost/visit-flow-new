import { useSyncExternalStore } from "react";

/** Ab Tablet-Breite (Tailwind md). */
const QUERY = "(min-width: 768px)";

function subscribe(onChange: () => void) {
  if (typeof window.matchMedia !== "function") return () => {};
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

/** true auf Tablet und Desktop. Dort erscheinen Sheets als schwebendes Panel statt von unten. */
export function useWideScreen(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => typeof window.matchMedia === "function" && window.matchMedia(QUERY).matches,
    () => false,
  );
}
