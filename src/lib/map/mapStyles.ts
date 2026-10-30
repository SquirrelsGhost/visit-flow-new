import type { Theme } from "../theme/themeContext";

export type MapStyleKey = "satellite" | "map";

/** Startansicht wie in v1: ganz Deutschland, bis der eigene Standort da ist. */
export const GERMANY_CENTER: [number, number] = [10.4515, 51.1657];
export const GERMANY_ZOOM = 5;
export const MY_POSITION_ZOOM = 17;

/** Standard ist Satellit (v1); "Karte" folgt dem App-Theme hell/dunkel. */
export function mapStyleUrl(key: MapStyleKey, theme: Theme): string {
  if (key === "satellite") return "mapbox://styles/mapbox/satellite-streets-v12";
  return theme === "dark" ? "mapbox://styles/mapbox/dark-v11" : "mapbox://styles/mapbox/light-v11";
}

/** Mapbox GL v3 braucht WebGL2. Fehlt es (alte iOS-Version, Stromsparmodus), zeigen wir eine klare Meldung. */
export function hasWebGL2(): boolean {
  try {
    return Boolean(document.createElement("canvas").getContext("webgl2"));
  } catch {
    return false;
  }
}

/** Mapbox-Schlüssel aus der Umgebungsvariable NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN. */
export const KNOWN_GOOD_MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? "";


/** Mapbox-Schlüssel aus Umgebung, localStorage oder dem v1-Fallback (in Tests nur explizit gesetzte Umgebung). */
export function resolveMapboxToken(): string {
  if (process.env.NODE_ENV === "test") return process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? "";
  if (typeof window !== "undefined") {
    try {
      const stored = window.localStorage.getItem("mapbox-token")?.trim();
      if (stored && stored.startsWith("pk.")) return stored;
    } catch {
      // localStorage nicht verfügbar
    }
  }
  return process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || KNOWN_GOOD_MAPBOX_TOKEN;
}

export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || KNOWN_GOOD_MAPBOX_TOKEN;
