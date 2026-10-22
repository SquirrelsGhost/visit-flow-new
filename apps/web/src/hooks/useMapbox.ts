import type { Map as MapboxMap } from "mapbox-gl";
import { useEffect, useRef, useState, type RefObject } from "react";
import { GERMANY_CENTER, GERMANY_ZOOM, hasWebGL2, mapStyleUrl, MAPBOX_TOKEN, type MapStyleKey } from "../lib/map/mapStyles";
import type { Theme } from "../lib/theme/themeContext";

export type MapFailure = "token" | "webgl" | "init";

interface MapboxState {
  map: MapboxMap | null;
  failure: MapFailure | null;
}

/**
 * Startet die Mapbox-Karte im Container (mapbox-gl wird erst hier geladen) und hält den Stil aktuell:
 * Satellit bleibt Satellit, "Karte" folgt dem App-Theme. Ohne Telemetrie an Mapbox, wie in v1.
 */
/** Fehler, die schon vor dem Start feststehen: kein Schlüssel oder kein WebGL2. */
function startupFailure(): MapFailure | null {
  if (!MAPBOX_TOKEN) return "token";
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
        mapboxgl.accessToken = MAPBOX_TOKEN;
        appliedStyle.current = initialStyle.current;
        map = new mapboxgl.Map({
          container: container.current,
          style: initialStyle.current,
          center: GERMANY_CENTER,
          zoom: GERMANY_ZOOM,
          attributionControl: false,
          performanceMetricsCollection: false,
          fadeDuration: 0,
        });
        map.addControl(new mapboxgl.AttributionControl({ compact: true }), "top-left");
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
