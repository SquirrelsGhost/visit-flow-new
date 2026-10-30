import type { Map as MapboxMap } from "mapbox-gl";
import { useEffect, useRef, useState, type RefObject } from "react";
import {
  GERMANY_CENTER,
  GERMANY_ZOOM,
  hasWebGL2,
  KNOWN_GOOD_MAPBOX_TOKEN,
  mapStyleUrl,
  resolveMapboxToken,
  type MapStyleKey,
} from "../lib/map/mapStyles";
import type { Theme } from "../lib/theme/themeContext";

export type MapFailure = "token" | "webgl" | "init";

interface MapboxState {
  map: MapboxMap | null;
  failure: MapFailure | null;
}

/** Fehler, die schon vor dem Start feststehen: kein Schlüssel oder kein WebGL2. */
function startupFailure(): MapFailure | null {
  if (!resolveMapboxToken()) return "token";
  return hasWebGL2() ? null : "webgl";
}

export function useMapbox(container: RefObject<HTMLDivElement | null>, styleKey: MapStyleKey, theme: Theme): MapboxState {
  const [state, setState] = useState<MapboxState>(() => ({ map: null, failure: startupFailure() }));
  const initialStyle = useRef(mapStyleUrl(styleKey, theme));
  const appliedStyle = useRef<string | null>(null);

  useEffect(() => {
    if (state.failure || !container.current) return;
    let map: MapboxMap | null = null;
    let cancelled = false;
    void import("mapbox-gl")
      .then(({ default: mapboxgl }) => {
        if (cancelled || !container.current) return;
        const token = resolveMapboxToken();
        mapboxgl.accessToken = token;
        appliedStyle.current = initialStyle.current;
        map = new mapboxgl.Map({
          container: container.current,
          style: initialStyle.current,
          center: GERMANY_CENTER,
          zoom: GERMANY_ZOOM,
          attributionControl: false,
          performanceMetricsCollection: false,
          fadeDuration: 0,
          transformRequest: (url: string) => {
            if (url.startsWith("https://api.mapbox.com/") && typeof window !== "undefined") {
              return { url: `${window.location.origin}/api/mapbox?url=${encodeURIComponent(url)}` };
            }
            return { url };
          },
        });
        map.on("error", (event: { error?: { status?: number; message?: string }; message?: string }) => {
          const status = event.error?.status;
          const msg = String(event.error?.message || event.message || "");
          if (status === 401 || status === 403 || /access token|unauthorized|forbidden/i.test(msg)) {
            if (mapboxgl.accessToken !== KNOWN_GOOD_MAPBOX_TOKEN) {
              try {
                window.localStorage.removeItem("mapbox-token");
              } catch {
                // ignorieren
              }
              mapboxgl.accessToken = KNOWN_GOOD_MAPBOX_TOKEN;
            }
          }
        });
        const ready = map;
        ready.once("load", () => !cancelled && setState({ map: ready, failure: null }));
      })
      .catch((error: unknown) => {
        console.error("Karte konnte nicht starten:", error);
        if (!cancelled) setState({ map: null, failure: "init" });
      });
    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [container, state.failure]);

  useEffect(() => {
    const url = mapStyleUrl(styleKey, theme);
    if (!state.map || appliedStyle.current === url) return;
    appliedStyle.current = url;
    state.map.setStyle(url);
  }, [state.map, styleKey, theme]);

  return state;
}
