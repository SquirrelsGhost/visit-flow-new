// Mapbox braucht den Browser (Canvas, WebGL, Standort)
"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { useMapbox } from "../../hooks/useMapbox";
import { useMyPosition } from "../../hooks/useMyPosition";
import { useTheme } from "../../hooks/useTheme";
import type { MapStyleKey } from "../../lib/map/mapStyles";
import MapControls from "./MapControls";
import MapNotice from "./MapNotice";

/**
 * Karte der Laufliste, Grundlage aus v1 (TrackingMap): Satellit als Start, eigener Standort mit Puls,
 * Stil-Wechsel und Folgen-Knopf. Häuser, Besuche und Live-Tracking kommen in den nächsten Schritten.
 */
export default function MapView() {
  const container = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const [styleKey, setStyleKey] = useState<MapStyleKey>("satellite");
  const { map, failure } = useMapbox(container, styleKey, theme);
  const { follow, locate } = useMyPosition(map);

  return (
    <div className="relative h-full w-full overflow-hidden bg-slate-200 dark:bg-slate-900" data-testid="map-view">
      <div ref={container} className="vf-map-canvas absolute inset-0" />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[5] bg-background"
        initial={{ opacity: 1 }}
        animate={{ opacity: map ? 0 : 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
      {failure ? (
        <MapNotice failure={failure} />
      ) : (
        <MapControls
          styleKey={styleKey}
          onToggleStyle={() => setStyleKey((current) => (current === "satellite" ? "map" : "satellite"))}
          following={follow}
          onLocate={locate}
        />
      )}
    </div>
  );
}
